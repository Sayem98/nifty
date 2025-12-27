import Book from "@/schemas/bookSchema";
import { connectToDB } from "@/utils/db";
import { getToken } from "next-auth/jwt";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function PATCH(req:any){
    try {
        revalidatePath('/', 'layout') 

        const session = await getToken({
            req: req,
            secret: process.env.NEXTAUTH_SECRET
        });
        
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = req.nextUrl.pathname.split("/")[4];

        // console.log(id);
        const body = await req.json()

        await connectToDB();
        const {...rest} = body;


        const updatedBook = await Book.findByIdAndUpdate(
            { _id: id }, 
            { $set: body }, 
            { new: true, runValidators: true } 
        );

        // const author = updatedBook.author;

        // const updatedAuthor = await User.findById(author);
        // updatedAuthor.yourBooks.push(updatedBook._id);
        // await updatedAuthor.save();

        // console.log(updatedBook);

        return NextResponse.json({
            data: updatedBook
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            message: "Something went wrong"
        }, { status: 500 })
    }
}