import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getToken } from "next-auth/jwt";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  try {
    const session = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role == "ANONYMOUS") {
      return NextResponse.json(
        { error: "This action cannot be performed as a guest." },
        { status: 501 }
      );
    }

    const formData = await request.formData();

    const name = formData.get("name");
    const description = formData.get("description") || "";
    const tokenId = formData.get("tokenId");
    const wallet = formData.get("wallet");
    const coverDate = formData.get("coverDate");
    const pdfDate = formData.get("pdfDate");
    const objectId = formData.get("id");

    console.log("||||||||||||||||||||||||||||||||");
    console.log("--------------------------------");
    console.log(
      name,
      description,
      tokenId,
      wallet,
      coverDate,
      pdfDate,
      objectId
    );
    console.log("--------------------------------");
    console.log("||||||||||||||||||||||||||||||||");

    if (!name || !tokenId || !wallet || !coverDate || !pdfDate || !objectId) {
      return NextResponse.json({ message: "missing" }, { status: 404 });
    }

    const metadata = {
      name,
      description:
        description + `. Visit ${process.env.NEXTAUTH_URL}/books/` + objectId,
      tokenId,
      image: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/users/${wallet}/content/${coverDate}/cover`,
      content: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/users/${wallet}/content/${pdfDate}/book`,
    };
    const metadataParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `users/${wallet}/metadata/${tokenId}`,
      Body: JSON.stringify(metadata),
      ContentType: "application/json",
    };
    const metadataCommand = new PutObjectCommand(metadataParams);
    await s3Client.send(metadataCommand);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
