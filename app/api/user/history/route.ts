import User from "@/schemas/userSchema";
import { connectToDB } from "@/utils/db";
import { getToken } from "next-auth/jwt";
import { useSession } from "next-auth/react";
import { NextResponse } from "next/server";


export async function POST(req: any) {

    // add to the array searchHistory in user schema of the user from session get email

    try{
    const session = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if(session.role == "ANONYMOUS"){
        return NextResponse.json({error:"This action cannot be performed as a guest."}, {status:501})
    }

    await connectToDB();
    
    const { search } = await req.json();
    const user = await User.findOne({ email: session.email });

    // console.log("helo00:", user);


    if(user.searchHistory){
        if (user.searchHistory.includes(search)) {
            return NextResponse.json({ message: "Search already exists in history" }, { status: 200 });
        }
        else{
            user.searchHistory.push(search);
        }
    }
    else{
        user.searchHistory = [search];
    }
    await user.save();

    return NextResponse.json({ message: "Search history updated" }, { status: 200 });
    }
    catch (error) {
        return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }

}