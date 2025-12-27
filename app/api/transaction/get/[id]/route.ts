import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import Transactions from "@/schemas/transactionSchema";
import User from "@/schemas/userSchema";
import Readlists from "@/schemas/readlistSchema";

export async function GET(req:any){
    revalidatePath("/", 'layout');
    try{
        const userId = req.nextUrl.pathname.split("/")[4];

        const user = await User.findById(userId);

        if(!user){
            return NextResponse.json({message: "No user exists"},{status: 404})
        }

        const arr = await Promise.all(user.yourBooks.map(async (item: any) => {
            const transactions = await Transactions.find({ book: item }).populate("book");
            const readlists = await Readlists.find({ book: item }).populate("book");
            return {transactions: transactions, readlists: readlists};
        }));

        return NextResponse.json({allBooks:arr}, {status:200});
    }
    catch(err){
        return NextResponse.json({error: err}, {status:500})
    }
}