import User from "@/schemas/userSchema";
import { connectToDB } from "@/utils/db";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function POST(req) {
    try{
        const body = await req.json();
        
        const {...rest } = body;
        
        await connectToDB();

        const session = await getToken({
            req: req,
            secret: process.env.NEXTAUTH_SECRET
        });
        
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // if(session.role == "ANONYMOUS"){
        //     return NextResponse.json({error:"This action cannot be performed as a guest."}, {status:501})
        // }

        // const userNameExists = await User.findOne({
        //     username
        // });

       

        if(rest.email){
            const emailExists = await User.findOne({
                email: rest.email
            })

            if(emailExists != null && emailExists.username != username ){
                return new NextResponse(JSON.stringify({success: false, error: "Email already exists"}), { status: 408 });
            }
            else if(emailExists != null && emailExists.username == username ){
                return new NextResponse(JSON.stringify({success: false, error: "Already registered"}), { status: 400 });
            }
            
        }

        if(rest.wallet){
            const walletExists = await User.findOne({wallet:rest.wallet})

            if(walletExists != null){
                return new NextResponse(JSON.stringify({user: walletExists}, {status: 200}));
            }
        }

        // if(userNameExists != null ){
        //     return new NextResponse(JSON.stringify({success: false, error: "Username already exists"}), { status: 409 });
        // }
        
        const user = await User.create({
            wallet: rest.wallet,
            username: rest.username,
            email: `${rest.wallet.substring(0,5)}@wallet`,
        }
    )

        user.mintedBooks[0] = rest.mintedBook;
        await user.save();


        return new NextResponse(JSON.stringify({
            user
        }), { status: 200 });
    }
    catch (error) {
        return new NextResponse(JSON.stringify(error), {
            status: 500,
        });
    }
}