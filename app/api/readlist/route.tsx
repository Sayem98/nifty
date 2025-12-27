import { NextResponse } from "next/server";
import { connectToDB } from "@/utils/db";
import User from "@/schemas/userSchema";
import Book from "@/schemas/bookSchema";
import { getToken } from "next-auth/jwt";
import Readlists from "@/schemas/readlistSchema"

export async function POST(req: any) {
    try {
        await connectToDB();
        const body = await req.json();
        const { email, bookId } = body;

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
    
            if (user.readlist.includes(bookId)) {
                return NextResponse.json({ message: "Book already in readlist" }, { status: 400 });
            }
    
            const book = await Book.findById(bookId);
            if (!book) {
                return NextResponse.json({ message: "Book not found" }, { status: 404 });
            }
    
            book.readers = (book.readers || 0) + 1;
            await book.save();
    
            user.readlist.push(bookId);
            await user.save();
    
            await Readlists.create({user:user._id, book: bookId});
    
            return NextResponse.json({
                message: "Book Added to Readlist! successfully",
                book: book,
                user: user
            }, { status: 200 });


    } catch (err) {
        console.error("Error adding book to readlist:", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: any) {
    try {
        await connectToDB();
        const body = await req.json();
        const { email, bookId } = body;

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

        // console.log(`Attempting to remove book ${bookId} from readlist of user ${email}`);

        const user = await User.findOne({ email: email });
        if (!user) {
            // console.log(`User not found: ${email}`);
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // console.log(`Current readlist: ${user.readlist}`);

        if (!user.readlist.includes(bookId)) {
            // console.log(`Book ${bookId} not in readlist`);
            return NextResponse.json({ message: "Book not in readlist" }, { status: 400 });
        }

        user.readlist = user.readlist.filter((id: any) => id.toString() !== bookId);
        await user.save();

        // console.log(`Updated readlist: ${user.readlist}`);

        const book = await Book.findById(bookId);
        if (!book) {
            // console.log(`Book not found: ${bookId}`);
            return NextResponse.json({ message: "Book not found" }, { status: 404 });
        }

        if (book.readers > 0) {
            book.readers -= 1;
        }
        await book.save();

        await Readlists.findOneAndDelete({book: bookId})

        // console.log(`Book ${bookId} removed from readlist and reader count updated`);
        return NextResponse.json({ message: "Book removed from readlist and reader count updated" }, { status: 200 });
    } catch (err) {
        // console.error("Error:", err);
        return NextResponse.json({ message: "An error occurred", error: err }, { status: 500 });
    }
}