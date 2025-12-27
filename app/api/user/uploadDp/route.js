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


async function uploadFileToS3 (file, wallet) {

    // console.log("Profile Create: Uploading File to S3");

    const fileBuffer = file;

    
    try{
        if(file){
        
            const params = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: `users/${wallet}/info/dp`,
                Body: fileBuffer,
                ContentType: "image/png"
            }
            const command = new PutObjectCommand(params);
            await s3Client.send(command);
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
        const wallet = formData.get('wallet');

        // console.log("WALLET", wallet);

        
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
        // console.log("USER", user, "WALLET", wallet);
        if(!user){
            return NextResponse.json({error: "User not found."}, {status: 404})
        }
        
        if(user.email !== session.email){
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }
        
        if(profileImage){
            const buffer = Buffer.from(await profileImage.arrayBuffer());
            const status = await uploadFileToS3(buffer, wallet);

            // console.log("HELLO I AM STATUS");
            if(status == true){
                user.profileImage = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/users/${wallet}/info/dp`;
                await user.save();
            }
            return NextResponse.json({success: user});
        }


    }
    catch(err){
        return NextResponse.json({error: "Error Uploading File"}, {status: 500})
    }
}


