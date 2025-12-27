import { connectToDB } from "@/utils/db";
import { NextResponse } from "next/server";
import BookReports from "@/schemas/bookReportSchema"
import User from "@/schemas/userSchema";
import Book from "@/schemas/bookSchema";
import { getToken } from "next-auth/jwt";

export async function POST(req:any){
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

        await connectToDB();
        const body = await req.json();

        const {bookId, email, tag} = body;

        const book = await Book.findOne({_id: bookId});
        const user = await User.findOne({email: email});

        console.log(bookId, email);

        if(!book || !user){
            return NextResponse.json({error: "missing"}, {status: 404});
        }

        const previous = await BookReports.findOne({book: bookId, user:user._id});

        if(previous){
            return NextResponse.json({error: "You've already made a report"}, {status: 407});
        }

        const report = await BookReports.create({
            book: bookId,
            reportedBy: user._id,
            tag
        })

        if(!report){
            return NextResponse.json({error: "Couldn't make report"}, {status: 406});
        }

        return NextResponse.json({report: report}, {status:200});

    }
    catch(err){
        return NextResponse.json({error: err}, {status:500})
    }
}