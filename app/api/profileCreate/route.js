import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getToken } from "next-auth/jwt";
import User from "@/schemas/userSchema";
import { connectToDB } from "@/utils/db";

const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
    }
});


async function uploadFileToS3 (file, wallet, bannerImage) {

    // console.log("Profile Create: Uploading File to S3");

    const fileBuffer = file;
    const bannerBuffer = bannerImage;

    
    try{
        if(file){
            const params = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: `users/${wallet}/info/profileImage`,
                Body: fileBuffer,
                ContentType: "image/png"
            }
            const command = new PutObjectCommand(params);
            await s3Client.send(command);
        }

        if(bannerImage){

            const params2 = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: `users/${wallet}/info/bannerImage`,
                Body: bannerBuffer,
                ContentType: "image/png"
            }
            const command2 = new PutObjectCommand(params2);
            await s3Client.send(command2);
        }



        return true;
    }
    catch(e){
        console.error("This is error: ", e);
        return false
    }
    
}

export async function PATCH(request){
    try{
        await connectToDB();
        const formData = await request.formData();
        const profileImage = formData.get('profileImage');
        const bannerImage = formData.get('bannerImage');

        const wallet = formData.get('wallet');
        

        // console.log(profileImage, bannerImage, wallet);
        
        if(!wallet){
            return NextResponse.json({error: "File is required."}, {status: 400})
        }
        
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
        
        const user = await User.findOne({wallet: wallet});
        
        if(!user){
            return NextResponse.json({error: "User not found."}, {status: 404})
        }
        
        if(user.email !== session.email){
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }
        
        if(profileImage){
            const buffer = Buffer.from(await profileImage.arrayBuffer());
            const status = await uploadFileToS3(buffer, wallet, null);
            return NextResponse.json({success: status});
        }

        if(bannerImage){
            const bannerBuffer = Buffer.from(await bannerImage.arrayBuffer());
            user.banner = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/users/${wallet}/info/bannerImage`
            await user.save()
            const status = await uploadFileToS3(null, wallet, bannerBuffer);
            return NextResponse.json({success: status});
        }


    }
    catch(err){
        return NextResponse.json({error: "Error Uploading File"}, {status: 500})
    }
}


export async function POST(request) {

    try{

        await connectToDB();
        const formData = await request.formData();
        const profileImage = formData.get('profileImage');
        const bannerImage = formData.get('bannerImage');

        const wallet = formData.get('wallet');
        
        if(!profileImage){
            return NextResponse.json({error: "File is required."}, {status: 400})
        }
        // if(!bannerImage){
        //     return NextResponse.json({error: "File is required."}, {status: 400})
        // }
        if(!wallet){
            return NextResponse.json({error: "File is required."}, {status: 400})
        }
        
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
        
        const user = await User.findOne({wallet: wallet});
        
        if(!user){
            return NextResponse.json({error: "User not found."}, {status: 404})
        }
        
        if(user.email !== session.email){
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }
        
        
        if(bannerImage){
            const buffer = Buffer.from(await profileImage.arrayBuffer());
            const bannerBuffer = Buffer.from(await bannerImage.arrayBuffer());
            const status = await uploadFileToS3(buffer, wallet, bannerBuffer);

            if(status){
                user.banner = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/users/${wallet}/info/bannerImage`
                user.collectionImage = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/users/${wallet}/info/profileImage`
                await user.save();
            }
            return NextResponse.json({success: status});

        }

        if(!bannerImage){
            console.log("NO BANNER", wallet);
            const buffer = Buffer.from(await profileImage.arrayBuffer());
            console.log(buffer);
            const status = await uploadFileToS3(buffer, wallet, null);
            if(status){
                user.collectionImage = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/users/${wallet}/info/profileImage`
                await user.save();
            }
            return NextResponse.json({success: status});
        }

    }
    catch(e){
        return NextResponse.json({error: "Error Uploading File"}, {status: 500})
    }
}
