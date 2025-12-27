import User from "@/schemas/userSchema";
import { connectToDB } from "@/utils/db";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(req : any) {

    revalidatePath('/', 'layout') 

    try{
        const wallet = req.nextUrl.pathname.split("/")[4];
        // console.log("contractadd",contractAddress)

        await connectToDB();
        const user = await User.findOne({wallet: wallet}).populate("yourBooks")

        return new NextResponse(JSON.stringify({
            user
        }), { status: 200 });
    }
    catch (error) {
        return new NextResponse(JSON.stringify(error), {
            status: 500,
        });
    }
}
