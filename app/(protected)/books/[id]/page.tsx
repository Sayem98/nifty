import type { Metadata, ResolvingMetadata } from "next";
import { BookFetcher } from "@/components/fetcher/bookFetcher";
import axios from "axios";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const id = params.id;
  // console.log(id);

  const book = await axios.get(`${process.env.NEXTAUTH_URL}/api/book/${id}`);
  // console.log("BOOK DATA",book.data);

  return {
    title: book?.data?.data?.name,
    openGraph: {
      title: book?.data?.data?.name,
      description: book?.data?.data?.description,
      url: `${process.env.NEXTAUTH_URL}/books/${id}`,
      siteName: "Nifty Tales",
      images: [
        {
          url: book?.data?.data?.cover, // Must be an absolute URL
          width: 800,
          height: 600,
        },
        {
          url: book?.data?.data?.cover, // Must be an absolute URL
          width: 1800,
          height: 1600,
          alt: "My custom alt",
        },
      ],
      locale: "en_US",
      type: "website",
    },
  };
}

export default function Page() {
  return (
    <>
      <div className="">
        <BookFetcher />
      </div>
    </>
  );
}
