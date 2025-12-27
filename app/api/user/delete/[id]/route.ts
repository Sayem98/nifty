import User from "@/schemas/userSchema";
import { connectToDB } from "@/utils/db";
import { getToken } from "next-auth/jwt";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function DELETE(req:any){
    revalidatePath('/', 'layout') 
    try{

        const session = await getToken({
            req: req,
            secret: process.env.NEXTAUTH_SECRET
        });
        
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if(session.role == "ANONYMOUS"){
            return NextResponse.json({error:"This action cannot be performed as a guest."}, {status:501})
        }

        const email = req.nextUrl.pathname.split("/")[4];
        await connectToDB();

        const user = User.findOne({email:email});

        if(!user){
            return NextResponse.json({message: "User not found"}, {status:404})
        }

        await User.findOneAndDelete({email:email});

        return NextResponse.json({deleted: true}, {status:200})
    }
    catch(err){
        return NextResponse.json({error: err}, {status:500})
    }
}