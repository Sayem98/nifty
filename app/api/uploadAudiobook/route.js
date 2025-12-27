import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getToken } from "next-auth/jwt";
import { connectToDB } from "@/utils/db";
import {CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
 DeleteObjectCommand
} from "@aws-sdk/client-s3";

import Book from "@/schemas/bookSchema";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
  }
});



async function uploadFileToS3(content, wallet, date) {
  try {
    if (!content) {
      console.error("No content provided for upload");
      return false;
    }

    // Ensure content is a Buffer
    const contentBuffer = Buffer.isBuffer(content) ? content : Buffer.from(content);

    const multipartUpload = await s3Client.send(new CreateMultipartUploadCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `users/${wallet}/content/${date}/audio`,
      ContentType: 'audio/mpeg',
      ContentDisposition: 'inline',
    }));

    const uploadId = multipartUpload.UploadId;

    const partSize = 5 * 1024 * 1024; // 5 MB
    const numParts = Math.ceil(contentBuffer.length / partSize);
    const uploadPromises = [];

    for (let i = 0; i < numParts; i++) {
      const start = i * partSize;
      const end = Math.min(start + partSize, contentBuffer.length);
      const partNumber = i + 1;

      const uploadPartCommand = new UploadPartCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `users/${wallet}/content/${date}/audio`,
        UploadId: uploadId,
        Body: contentBuffer.slice(start, end),
        PartNumber: partNumber,
      });

      uploadPromises.push(
        s3Client.send(uploadPartCommand)
          .then((data) => {
            console.log(`Part ${partNumber} uploaded`);
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
      Key: `users/${wallet}/content/${date}/audio`,
      UploadId: uploadId,
      MultipartUpload: { Parts: uploadResults },
    }));

    console.log("Multipart upload completed successfully");
    return true;
  } catch (e) {
    console.error("Error in uploadFileToS3:", e);
    if (e.name === 'CredentialsProviderError') {
      console.error("AWS credentials are invalid or not properly configured");
    } else if (e.$metadata) {
      console.error("AWS S3 error metadata:", e.$metadata);
    }
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

export async function POST(req) {
  const session = await getToken({
    req: req,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role == "ANONYMOUS") {
    return NextResponse.json({ error: "This action cannot be performed as a guest." }, { status: 501 })
  }

  try {
    const formData = await req.formData();
    await connectToDB();

    const audio = formData.get('audio');
    const wallet = formData.get("wallet");
    const id = formData.get('bookId')
    const date = Date.now();

    if (!audio) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const contentArrayBuffer = await audio.arrayBuffer();

    const status = await uploadFileToS3(contentArrayBuffer, wallet, date);

    if (status) {
      const book =await Book.findById(id);
      console.log(book);
      if(book?.audiobook !== ""){
        const key = `users/${wallet}/content/${book?.audiobook?.split("/")[6]}/audio`
        await deleteFileFromS3(key);
      }

      book.audiobook = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/users/${wallet}/content/${date}/audio`;
      await book.save();
      return NextResponse.json({ res: true }, { status: 200 })
    } else {
      return NextResponse.json({ res: "Upload failed" }, { status: 500 })
    }

  } catch (err) {
    console.error("Error in POST handler:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
