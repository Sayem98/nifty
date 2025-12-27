import { connectToDB } from "@/utils/db";
import { NextResponse } from "next/server";
import Bookmarks from "@/schemas/bookmarkSchema";

export async function GET(req:any){
    try{
        await connectToDB();
        const id = req.nextUrl.pathname.split("/")[4];

        const bookmarks = await Bookmarks.find({user: id}).populate("book");

        if(bookmarks.length == 0){
            return NextResponse.json({message: "Not found any"}, {status: 404})
        }

        return NextResponse.json({bookmarks: bookmarks}, {status: 200})
    }
    catch(err){
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
        console.log(err);
    }
}