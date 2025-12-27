import { NextResponse } from "next/server";
import BookReports from "@/schemas/bookReportSchema";
import Book from "@/schemas/bookSchema";
import User from "@/schemas/userSchema";
import { revalidatePath } from "next/cache";
import { connectToDB } from "@/utils/db";

export async function GET(req:any){
    revalidatePath("/", "layout");
    try{
        const email = req.nextUrl.pathname.split("/")[4];

        await connectToDB();

        const user = await User.findOne({email: email});

        if(!user){
            return NextResponse.json({error: "User not found"},{status:404});
        }

        const books = await Book.find({author: user._id});

        if(books.length == 0){
            return NextResponse.json({error: "No reported books"}, {status:404});
        }

        const arr:any = []

        await Promise.all(books.map(async(item:BookType)=>{
            const reports = await BookReports.find({book: item._id});

            if(reports.length > 0){
                //@ts-ignore
                const inap = reports.filter(report => report.tag == "Inappropriate Content").length;
                const hate = reports.filter(report => report.tag == "Hate Speech").length;
                const graphic = reports.filter(report => report.tag == "Graphic Violence").length;
                const porno = reports.filter(report => report.tag == "Pornographic").length;
                const plag = reports.filter(report => report.tag == "Plagiarism").length;

                const tagsArr = [];
                const name = item.name;
                const status = item.isAdminRemoved;
                const reportNum = reports.length;

                if(inap > 0){
                    tagsArr.push("Inappropriate")
                }

                if(hate > 0){
                    tagsArr.push("Hate")
                }

                if(graphic > 0){
                    tagsArr.push("Graphic")
                }

                if(porno > 0){
                    tagsArr.push("Pornographic")
                }

                if(plag > 0){
                    tagsArr.push("Plagiarism")
                }
                arr.push({name, status, reportNum, tagsArr});
            }
            return ;
        }))

        return NextResponse.json({array:arr}, {status:200});
    }
    catch(err){
        console.log(err);
        return NextResponse.json({error: err}, {status:500})
    }
}