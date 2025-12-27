import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import Transactions from "@/schemas/transactionSchema";
import User from "@/schemas/userSchema";
import Readlists from "@/schemas/readlistSchema";
import { useSearchParams } from "next/navigation";

export async function GET(req:any){
    revalidatePath("/", 'layout');

    //get the query params
    const searchParams = req.nextUrl.searchParams;

    const page = searchParams.get('page')
    try{
        const transactions = await Transactions.find().skip((parseInt(page)-1)*10).limit(10).sort({createdAt: -1}).populate('book').populate('user').exec();
        return NextResponse.json({txns:transactions}, {status:200});
    }
    catch(err){
        return NextResponse.json({error: err}, {status:500})
    }
}