import { NextResponse } from "next/server";

import Bookmarks from "@/schemas/bookmarkSchema"
import { connectToDB } from "@/utils/db";
import Book from "@/schemas/bookSchema";
import User from "@/schemas/userSchema";

export async function GET(req:any){
    try{
        await connectToDB();
        const id = req.nextUrl.pathname.split("/")[3].split("-")[0];
        const userId = req.nextUrl.pathname.split("/")[3].split("-")[1];

        // console.log(id, userId)

        const book = await Book.findById(id);
        const user = await User.findById(userId)

        if(!book || !user){
            return NextResponse.json({message: "Not Found"},{status: 404})
        }

        const bookmark = await Bookmarks.findOne({book: id, user:userId});

        if(!bookmark){
            return NextResponse.json({message: "Bookmark Not Found"},{status: 404})
        }

        return NextResponse.json({data: bookmark}, {status:200});
    }
    catch(err){
        return NextResponse.json({message: err}, {status:500})
    }
}