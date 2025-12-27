import Book from "@/schemas/bookSchema"
import { connectToDB } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache";
import User from "@/schemas/userSchema";


type BookType = {
    name: string;
    isPublished?: boolean;
    price?: number;
    maxMint?: number;
    cover?: string | null;
    author: Object | null;
    artist?: string | null;
    ISBN?: string | null;
    description?: string | null;
    tags?: string[];
    pdf: string;
    readers?: number;
    isBoosted?: string | null;
    createdAt?: Date;
}

// get all books route
export async function GET(req: NextRequest) {
    revalidatePath('/', 'layout');

    try {
        await connectToDB();
        const url = new URL(req.url);
        const limit = parseInt(url.searchParams.get("limit") || "0", 10);
        const type = url.searchParams.get("type") || "latest";

        let books: BookType[] = [];

        if(type == "trending"){
            books= await Book.find({isAdminRemoved: false, isPaused:false, isHidden:false, isPublished:true}).sort({ readers: -1 }).limit(limit);
        }
        else if(type == "latest"){
            books= await Book.find({isAdminRemoved: false, isPaused:false, isHidden:false, isPublished:true}).sort({ createdAt: -1 }).limit(limit);
        }
        else if(type == "boosted"){
            books= await Book.find({ isBoosted: { $exists: true, $ne: null }, isAdminRemoved: false, isPaused:false, isHidden:false, isPublished:true })
                .where("isBoosted").gt((new Date()).getMilliseconds())
                .sort({ createdAt: -1 }).limit(limit);
        }

        console.log(books.length, limit);

        if (books.length === 0) {
            return NextResponse.json({
                data: [],
                message: "No books found"
            }, { status: 200 });
        }

        return NextResponse.json({
            data: books
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            message: "Something went wrong"
        }, { status: 500 });
    }

}