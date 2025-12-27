import Book from "@/schemas/bookSchema"
import { connectToDB } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache";
import User from "@/schemas/userSchema";
import { getToken } from "next-auth/jwt";



export async function GET(req: NextRequest) {

    try {
        revalidatePath('/', 'layout') 

        const id = req.nextUrl.pathname.split("/")[3];

        // console.log(id);

        await connectToDB();
        const book: BookType | null = await Book.findById(id);

        const user: UserType | null = await User.findById({_id: book?.author});

        // console.log(book, user);

        if (!book) {
            return NextResponse.json({
                data: "",
                message: "Book not found"
            }, { status: 404 })
        }

        return NextResponse.json({
            data: book,
            user: user
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            message: "Something went wrong"
        }, { status: 500 })
    }

}

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


        if(session.role == "ANONYMOUS"){
            return NextResponse.json({error:"This action cannot be performed as a guest."}, {status:501})
        }

        const id = req.nextUrl.pathname.split("/")[3];

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

export async function DELETE(req: any) {
        // Revalidate the path to update any static pages
        revalidatePath('/', 'layout');
    try {
        // Connect to the database
        await connectToDB();

        // Extract the book ID from the URL
        const id = req.nextUrl.pathname.split("/")[3];

        if (!id) {
            return NextResponse.json({ message: "Book ID is required" }, { status: 400 });
        }

        // Find the book and delete it
        const deletedBook = await Book.findByIdAndDelete({_id: id});
        // console.log("DELETED BOOK",deletedBook);
        if (!deletedBook) {
            return NextResponse.json({ message: "Book not found" }, { status: 404 });
        }

        // Find all users who have this book in their array and remove it
        await User.updateMany(
            { yourBooks: id },
            { $pull: { yourBooks: id } }
        );

        return NextResponse.json({ message: "Book deleted successfully and removed from users", data: deletedBook }, { status: 200 });

    } catch (error) {
        console.error("Error deleting book:", error);
        return NextResponse.json({ message: "Error deleting book" }, { status: 500 });
    }
}