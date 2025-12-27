import Book from "@/schemas/bookSchema";
import Transactions from "@/schemas/transactionSchema"
import User from "@/schemas/userSchema";
import { connectToDB } from "@/utils/db";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectToDB();

        const body = await req.json();
        const { txnHash, bookId, userId, value, amount } = body;

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

        if (!txnHash || !bookId || !userId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // console.log("TRANSACTIONNNN",txnHash);


        const book = await Book.findById({_id:bookId})
        const user = await User.findById({_id:userId})


        if (!book || !user) {
            return NextResponse.json({ error: "Book or User not found" }, { status: 404 });
        }

        const txn = await Transactions.create({ txnHash, book: bookId, user: userId, value, amount });
        // console.log("I AM USER", user.mintedBooks);
        if(!user.mintedBooks.includes(bookId)){
            // console.log("savingggg");
            user.mintedBooks.push(bookId);
            await user.save();
        }

        // console.log("new user", user)

        return NextResponse.json({ txn: txn }, { status: 200 });
    } catch (err) {
        console.error("Error in transaction creation:", err);
        return NextResponse.json({ error: "Internal Server Error", details: err }, { status: 500 });
    }
}