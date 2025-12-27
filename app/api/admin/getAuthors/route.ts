import BookReports from "@/schemas/bookReportSchema";

import User from "@/schemas/userSchema";
import { connectToDB } from "@/utils/db";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(req:any){
    revalidatePath("/", "layout");
    try{
        await connectToDB();

        const users = await User.find();

        if(!users){
            return NextResponse.json({error: "No books found"}, {status:404});
        }
        return NextResponse.json({array:users}, {status:200});

    }
    catch(err){
        return NextResponse.json({error: err}, {status:500})
    }
}