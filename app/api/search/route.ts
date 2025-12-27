import Book from "@/schemas/bookSchema";
import User from "@/schemas/userSchema";
import { connectToDB } from "@/utils/db";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function GET(req: any) {
    try {
        await connectToDB();
        const url = new URL(req.url);
        const searchString = url.searchParams.get('query');
        const email = url.searchParams.get('user');


        if (!searchString) {
            return new NextResponse(JSON.stringify({ error: "Search query is required" }), { status: 400 });
        }

        var result1 = await User.find({$or: [
            { username: { $regex: searchString, $options: 'i' } },
            { collectionName: { $regex: searchString, $options: 'i' } }
        ] }).populate('yourBooks');

        var result2 = await Book.find({
            $or: [
                { name: { $regex: searchString, $options: 'i' } },
                { tags: { $in: [new RegExp(searchString, 'i')] } }
            ]
        });

        result1 = result1.filter(user => user.collectionName !== "")
        result2 = result2.filter(book => !book.isAdminRemoved && !book.isHidden && book.isPublished )


        const slicedResult1 = result1?.slice(0, 2) || [];
        const slicedResult2 = result2?.slice(0, 2) || [];

        const session = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET
        });

        if (!session || session.role == "ANONYMOUS") {
            return new NextResponse(JSON.stringify({ history: null, user: slicedResult1, book: slicedResult2}), { status: 200 });
        }

        const user = await User.findOne({email:email});

        if(!user){
            return NextResponse.json({error: "USER NOT FOUND"}, {status: 404});
        }


        return new NextResponse(JSON.stringify({user: slicedResult1, book: slicedResult2, history: user.searchHistory}), { status: 200 });
    } catch (error) {
        console.error("Error in GET request:", error);
        return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}