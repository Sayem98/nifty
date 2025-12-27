import User from "@/schemas/userSchema";
import { connectToDB } from "@/utils/db";
import { getToken } from "next-auth/jwt";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req:any){

    try{
        const body = await req.json();
        
        const {wallet, email} = body;

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

        await connectToDB();

        const user = await User.findOne({wallet: wallet});

        // console.log("FIRST USER FETCHED", user)

        if(user){
            return new NextResponse(JSON.stringify({
                message: "Wallet Already Set"
            }), { status: 400 });
        }

        // console.log("FIRST USER FETCHED")
        
        if(!user){
            const newUser = await User.findOne({email:email});
            if(newUser.wallet == ""){
                // console.log("THIS IS THE USER", newUser)
                newUser.wallet = wallet;
                await newUser.save()
                return new NextResponse(JSON.stringify({
                    message: "Wallet Set"
                }), { status: 201 });
            }
            else{
                return new NextResponse(JSON.stringify({
                    message: "Account has a linked wallet"
                }), { status: 403 });
            }
        }


    }
    catch(err){
        // console.log(err);
        return NextResponse.json({error: err}, {status:500});
    }
}