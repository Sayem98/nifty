import { NextResponse } from "next/server";
import { connectToDB } from "@/utils/db";
import User from "@/schemas/userSchema";
import Book from "@/schemas/bookSchema";
import { getToken } from "next-auth/jwt";
import Bookmarks from "@/schemas/bookmarkSchema"

export async function POST(req: any) {
    try {
        await connectToDB();
        const body = await req.json();
        const { email, bookId, page } = body;

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

        const user = await User.findOne({ email: email });
        
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const book = await Book.findById(bookId);

        if (!book) {
            return NextResponse.json({ message: "Book not found" }, { status: 404 });
        }

        const oldBookmark = await Bookmarks.findOne({book: bookId, user:user._id});

        if(oldBookmark && oldBookmark){
            await Bookmarks.findOneAndDelete({book: bookId});
        }

        const bookmark = await Bookmarks.create({
            book: bookId,
            user: user._id,
            page
        })

        return NextResponse.json({
            message: "Bookmark added successfully",
            bookmark: bookmark,
        }, { status: 200 });
    } catch (err) {
        console.error("Error adding book to readlist:", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}


