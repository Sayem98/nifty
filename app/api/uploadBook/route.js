import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand, DeleteObjectCommand
} from "@aws-sdk/client-s3";

import { getToken } from "next-auth/jwt";


import Book from "@/schemas/bookSchema";
import { connectToDB } from "@/utils/db";
import User from "@/schemas/userSchema";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
  }
});

async function uploadFileToS3(cover, content, wallet, date) {
  try {
    // Upload Cover
    // console.log("UPLOADING YOOOOOO");


    if(cover){
      // console.log("COVER MY ASS", cover);
      const coverParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `users/${wallet}/content/${date}/cover`,
        Body: cover,
        ContentType: "image/png"
      }
      const coverCommand = new PutObjectCommand(coverParams);
      await s3Client.send(coverCommand);
      // console.log("COVER IS DONE", cover);
    }

    // Upload Content (PDF)
    // console.log("ABOUT TO ENTER CONTENT");
    if (content) {
      try {
        // console.log("CONSOLE IS LOGINNGIN",content);
        const multipartUpload = await s3Client.send(new CreateMultipartUploadCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `users/${wallet}/content/${date}/book`,
          ContentType: 'application/pdf',
          ContentDisposition: 'inline',
        }));
    
        const uploadId = multipartUpload.UploadId;
        // console.log("Content length:", content.length);
    
        const partSize = 5 * 1024 * 1024; // 5 MB
        const numParts = Math.ceil(content.length / partSize);
        const uploadPromises = [];
    
        for (let i = 0; i < numParts; i++) {
          const start = i * partSize;
          const end = Math.min(start + partSize, content.length);
          const partNumber = i + 1;
    
          const uploadPartCommand = new UploadPartCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `users/${wallet}/content/${date}/book`,
            UploadId: uploadId,
            Body: content.slice(start, end),
            PartNumber: partNumber,
          });
    
          uploadPromises.push(
            s3Client.send(uploadPartCommand)
              .then((data) => {
                // console.log(`Part ${partNumber} uploaded`);
                return { ETag: data.ETag, PartNumber: partNumber };
              })
              .catch((error) => {
                console.error(`Error uploading part ${partNumber}:`, error);
                throw error;
              })
          );
        }
    
        const uploadResults = await Promise.all(uploadPromises);
    
        await s3Client.send(new CompleteMultipartUploadCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `users/${wallet}/content/${date}/book`,
          UploadId: uploadId,
          MultipartUpload: { Parts: uploadResults },
        }));
    
        // console.log("Multipart upload completed successfully");
      } catch (error) {
        console.error("Error in multipart upload:", error);
        // Handle the error appropriately (e.g., retry, notify user, etc.)
      }
    }

    return true;
  } catch(e) {
    console.error(e);
    return false;
  }
}

async function deleteFileFromS3(key){
  try{
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const data = await s3Client.send(new DeleteObjectCommand({Bucket:bucketName, Key:key}));
    if(data){
      console.log("____----____----____----____----");
      console.log("____----____----____----____----");
      console.log("____----____----____----____----");
      console.log("Success. Object deleted.", data);
      console.log("____----____----____----____----");
      console.log("____----____----____----____----");
      console.log("____----____----____----____----");
      return true;
    }
    else{
      return false;
    }
  }
  catch(err){
    console.log(err);
  }
}

export async function POST(request) {
  try {
    // console.log("UPLOAD FUNCTION HAS BEEN CALLED");

    const session = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
  });
  
  if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if(session.role == "ANONYMOUS"){
    return NextResponse.json({error:"This action cannot be performed as a guest."}, {status:501})
}

    const formData = await request.formData();
    connectToDB();
    
    const name = formData.get('name');
    const isbn = formData.get('isbn');
    const description = formData.get('description');
    const tags = formData.getAll('tags') || [];
    const artist = formData.get('artist') || "";
    const contractAdd = formData.get('contractAdd');
    const cover = formData.get('cover') || null;
    const content = formData.get('content') || null;
    const price = formData.get('price') || 0;
    const maxMint = formData.get('maxMint') || 0;
    const tokenId = formData.get('tokenId');
    const wallet = formData.get('wallet');
    const id = formData.get('id');
    const maxMintsPerWallet = formData.get('maxMintsPerWallet');

    // console.log("COVER",cover, content)
    if( !name  || !tags || !tokenId || !wallet ) {
      return NextResponse.json({error: "All fields are required."}, {status: 401});
    }

    const date = Date.now();

    const author = await User.findOne({wallet});

    if(!author){
      return NextResponse.json({message:"Author not found"},{status:404});
    }

    let bookdData = {
      name,
      isPublished: false,
      tokenId,
      contractAddress: contractAdd,
      maxMintsPerWallet,
      price,
      maxMint,
      author: author._id,
      artist: artist || "",
      ISBN: isbn || "",
      description,
      tags: tags || []
    }


    if( content && !cover && id==""){
      const contentArrayBuffer = await content.arrayBuffer();
      const contentBuffer = Buffer.from(contentArrayBuffer);
      const book = await Book.create(bookdData);
      const status = await uploadFileToS3(null, contentBuffer, wallet, date);

      if(status){
        if(!author.yourBooks.includes(book._id)){
          author.yourBooks.push(book._id);
          await author.save();
        }
        
  
        if(status === true){ 
          book.pdf = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/users/${wallet}/content/${date}/book`;
          book.isPublished = false;
          book.createdAt = Date.now();
          await book.save();
          return NextResponse.json({success: book}, {status:200});
        }

      }

      else{
        await Book.findOneAndDelete({_id:book._id});
      }
    }

    if(cover && !content && id !== ""){
      const book = await Book.findById(id);

      const key = `users/${wallet}/content/${book.cover.split("/")[6]}/cover`;
      const res = await deleteFileFromS3(key);

      if(!res){
        return NextResponse.json({error: "Error while deleting previous file"}, {status:406});
      }

      const coverBuffer = Buffer.from(await cover.arrayBuffer());
      const status = await uploadFileToS3(coverBuffer, null, wallet, date);

      if(status === false) {
        return NextResponse.json({error: "Something went wrong while uploading"}, {status: 501});
      }

      if(status === true){
        book.name = name;
        book.ISBN = isbn
        book.cover = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/users/${wallet}/content/${date}/cover`;
        book.description = description;
        book.tags = tags;
        book.artist = artist;
        book.price = price;
        book.tokenId = tokenId;
        book.maxMint = maxMint;
        book.maxMintsPerWallet = maxMintsPerWallet;

        book.createdAt = Date.now();
        
        await book.save();
        
        if(!author.yourBooks.includes(id)){
        author.yourBooks.push(id);
        await author.save()
        }
        return NextResponse.json({success: book}, {status:200});
      }

    }
    // Handle PDF content
    if(content && !cover && id !== ""){
      const book = await Book.findById(id);

      const key = `users/${wallet}/content/${book.pdf.split("/")[6]}/book`;
      const res = await deleteFileFromS3(key);

      if(!res){
        return NextResponse.json({error: "Error while deleting previous file"}, {status:406});
      }

      const contentArrayBuffer = await content.arrayBuffer();
      const contentBuffer = Buffer.from(contentArrayBuffer);

      const status = await uploadFileToS3(null, contentBuffer, wallet, date);

      if(status === false) {
        return NextResponse.json({error: "Something went wrong while uploading"}, {status: 501});
      }

      if(status === true){
        book.name = name;
        book.ISBN = isbn
        book.description = description;
        book.tags = tags;
        book.pdf = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/users/${wallet}/content/${date}/book`;

        book.artist = artist;
        book.price = price;
        book.tokenId = tokenId;
        book.maxMint = maxMint;
        book.maxMintsPerWallet = maxMintsPerWallet;
        book.isPublished = false  
        book.createdAt = Date.now();
        await book.save();

        if(!author.yourBooks.includes(id)){
          author.yourBooks.push(id);
          await author.save()
          }
          return NextResponse.json({success: book}, {status:200});
        }
    }

    if(content && cover && id == ""){
      const contentArrayBuffer = await content.arrayBuffer();
      const contentBuffer = Buffer.from(contentArrayBuffer);
      const coverBuffer = Buffer.from(await cover.arrayBuffer());
      const newBook = await Book.create(bookdData);
      const status = await uploadFileToS3(coverBuffer, contentBuffer, wallet, date);
      
      if(status === true){
        if(!author.yourBooks.includes(newBook._id)){
          author.yourBooks.push(newBook._id);
          await author.save()
          }
        // console.log("Hellooooooo");
        // console.log("NEW BOOK",newBook)
        newBook.cover = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/users/${wallet}/content/${date}/cover`;
        newBook.pdf = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/users/${wallet}/content/${date}/book`;

        await newBook.save();

        return NextResponse.json({success: newBook}, {status:200});
      }
      else{
        await Book.findOneAndDelete({_id:newBook._id});
      }
    }

    if(content && cover && id !== ""){
      const book = await Book.findById(id);

      const key1 = `users/${wallet}/content/${book.cover.split("/")[6]}/cover`;
      const res1 = await deleteFileFromS3(key1);

      if(!res1){
        return NextResponse.json({error: "Error while deleting previous file"}, {status:406});
      }

      const key2 = `users/${wallet}/content/${book.pdf.split("/")[6]}/book`;
      const res2 = await deleteFileFromS3(key2);

      if(!res2){
        return NextResponse.json({error: "Error while deleting previous file"}, {status:406});
      }

      const contentArrayBuffer = await content.arrayBuffer();
      const contentBuffer = Buffer.from(contentArrayBuffer);
      const coverBuffer = Buffer.from(await cover.arrayBuffer());

      const status = await uploadFileToS3(coverBuffer, contentBuffer, wallet, date);

      if(status === true){
        
        book.name = name;
        book.ISBN = isbn
        book.description = description;
        book.tags = tags;
        book.pdf = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/users/${wallet}/content/${date}/book`;
        book.cover = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/users/${wallet}/content/${date}/cover`;
        book.artist = artist;
        book.price = price;
        book.tokenId = tokenId;
        book.maxMint = maxMint;
        book.maxMintsPerWallet = maxMintsPerWallet;

        book.isPublished = false  
        book.createdAt = Date.now();
        await book.save();


        if(!author.yourBooks.includes(id)){
          author.yourBooks.push(id);
          await author.save()
          }

        return NextResponse.json({success: book}, {status:200});

      }
    }

  } catch(e) {
    console.error(e);
    return NextResponse.json({error: "Error Uploading File"}, {status: 500});
  }
}

export async function PATCH(request){
  try {
    const formData = await request.formData();
    connectToDB();
    
    const name = formData.get('name');
    const isbn = formData.get('isbn');
    const description = formData.get('description');
    const tags = formData.getAll('tags') || [];
    const artist = formData.get('artist');

    const price = formData.get('price') || 0;
    const maxMint = formData.get('maxMint') || 0;
    const tokenId = formData.get('tokenId');
    const wallet = formData.get('wallet');
    const id = formData.get("id");
    const maxMintsPerWallet = formData.get('maxMintsPerWallet');


    if(!name || !tags || !tokenId || !wallet ) {
      return NextResponse.json({error: "All fields are required."}, {status: 400});
    }

    const book = await Book.findById(id);
        book.name = name;
        book.ISBN = isbn
        book.maxMint = maxMint;
        book.description = description;
        book.tags = tags;
        book.artist = artist;
        book.price = price;
        book.tokenId = tokenId;
        book.isPublished = false;
        book.createdAt = Date.now();
        book.maxMintsPerWallet = maxMintsPerWallet;
        await book.save();
        return NextResponse.json({success: book});


  }
  catch(err){
    
    return NextResponse.json({error: "Error Updating File"}, {status: 500});

  }
}

