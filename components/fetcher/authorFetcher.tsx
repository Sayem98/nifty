"use client";

import { usePathname } from "next/navigation";
import { ethers } from "ethers";
import abi from "@/utils/abis/templateABI";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import Image from "next/image";
import { WalletConnectButton } from "@/components/buttons/WalletConnectButton";
import Navbar from "@/components/Home/Navbar";
import { useGlobalContext } from "@/context/MainContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import Book from "@/components/Global/Book";
import { useLoading } from "@/components/PageLoader/LoadingContext";
import placeholder from "@/assets/og.png";
import { CiShare2 } from "react-icons/ci";
import { toast } from "react-toastify";
import { FaGlobeAmericas, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiFarcaster } from "react-icons/si";

export default function AuthorFetcher() {
  const pathName = usePathname();

  const [address, setAddress] = useState<string>("");
  const [slicer, setSlicer] = useState<number>(0);
  const [user, setUser] = useState<UserType>();

  const { night } = useGlobalContext();

  const [publishedBooks, setPublishedBooks] = useState([]);

  useEffect(() => {
    setAddress(pathName.split("/")[pathName.split("/").length - 1]);
  }, [pathName]);

  const router = useRouter();

  const [name, setName] = useState<string>("");

  async function contractSetup() {
    try {
      //@ts-ignore

      //@ts-ignore

      //@ts-ignore
      const provider = new ethers.getDefaultProvider(
        "https://base-mainnet.g.alchemy.com/v2/2L082LzB4Kl82BLjvBpMBgEnz3eTuq1v"
      );

      //@ts-ignore
      const contract = new ethers.Contract(user?.contractAdd, abi, provider);

      return contract;
    } catch (err) {
      console.error(err);
    }
  }

  async function getContractDetails() {
    try {
      const contract = await contractSetup();
      const contractName = await contract?.name();

      setName(contractName);
    } catch (err) {
      console.error(err);
    }
  }

  async function getUser() {
    try {
      await axios.get("/api/user/authors/" + address).then((res) => {
        setUser(res.data.user);
        // console.log(res.data.user);
      });
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    if (user) {
      getContractDetails();
    }
  }, [user]);

  useEffect(() => {
    if (address) {
      // console.log(address);
      getUser();
    }
  }, [address]);

  useEffect(() => {
    if (user) {
      var arr1: any = [];
      var subArr1: any = [];

      user.yourBooks.reverse().map((item: any, i) => {
        if (item.isPublished && !item.isHidden && !item.isAdminRemoved) {
          subArr1.push(item);
        }
        if (subArr1.length == slicer || i == user.yourBooks.length - 1) {
          if (subArr1.length > 0) arr1.push(subArr1);
          subArr1 = [];
        }
      });

      //@ts-ignore
      setPublishedBooks(arr1);
      //@ts-ignore
    }
  }, [slicer, user]);

  useEffect(() => {
    const screenWidth = window?.innerWidth;

    if (screenWidth > 1100) {
      setSlicer(5);
    } else if (screenWidth <= 1100) {
      setSlicer(4);
    }
  }, []);

  //   async function tokenChecker() {
  //     try {
  //       const res = await axios.get("/api/tokenChecker");
  //     //   console.log(res.data);
  //     } catch (error) {
  //       if (axios.isAxiosError(error) && error.response?.status === 401) {
  //         router.push('/connect');
  //       } else {
  //         console.error("An error occurred:", error);
  //       }
  //     }
  //   }

  //   useEffect(() => {
  //     tokenChecker();
  //   }, []);

  return (
    <div
      className={`min-h-screen dark:text-white dark:bg-nifty-black text-black bg-white`}
    >
      {/* <div className="h-16 w-screen relative z-[1000]">
                <Navbar/>
            </div> */}
      <div
        className={`w-screen h-screen fixed top-0 left-0 z-[-1] dark:bg-nifty-black bg-white`}
      ></div>

      <div className="w-screen relative h-[15rem] md:h-[22rem] max-md:flex items-center justify-center overflow-hidden object-fill ">
        <div className="w-screen absolute h-full overflow-hidden">
          <Image
            width={1080}
            height={1080}
            src={
              user?.banner != ""
                ? ((user?.banner + "?v=" + Date.now()) as string)
                : placeholder
            }
            alt="dp"
            className="w-full h-full object-cover object-center absolute top-1/2 left-1/2 transform -translate-x-1/2 brightness-75 -translate-y-1/2"
          />
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(
              `${process.env.NEXTAUTH_URL}/authors/` + user?.wallet
            );
            toast.success("Successfully copied link!");
          }}
          className="absolute bottom-0 right-0 bg-white/10 px-4 py-2 z-[100] text-white font-semibold md:right-0 rounded-tl-xl border-t-[1px] hover:bg-white/20 duration-200 border-l-[1px] border-white"
        >
          <CiShare2 />
        </button>

        <div className="flex gap-8 max-md:gap-4 object-center items-center h-full md:px-10 w-screen justify-center md:justify-start my-auto absolute z-50 backdrop-blur-xl">
          <Image
            width={1080}
            height={1080}
            src={user?.collectionImage + "?v=" + Date.now() || ""}
            alt="dp"
            className="md:w-[10rem] object-cover object-center md:h-[10rem] h-[6rem] w-[6rem] border-4 border-white rounded-xl"
          />
          <div className="flex flex-col gap-1">
            <h2 className="md:text-4xl text-2xl font-bold text-white">
              {user?.collectionName}
            </h2>
            <h2 className="md:text-xl text-md my-1 font-semibold text-white">
              Author: {user?.username}
            </h2>
            <a
              href={`https://basescan.org/address/${user?.contractAdd}`}
              target="_blank"
              className="md:text-md underline text-xs font-semibold text-white"
            >
              Check on BaseScan
            </a>

            <div className="flex gap-2 my-2">
              {user?.instagram != "" && (
                <a
                  href={user?.instagram}
                  target="_blank"
                  className="w-8 h-8 text-xl bg-white/10 hover:scale-105 duration-200 border-[1px] border-white rounded-md flex items-center justify-center"
                >
                  <FaInstagram />
                </a>
              )}
              {user?.twitter != "" && (
                <a
                  href={user?.twitter}
                  target="_blank"
                  className="w-8 h-8 text-xl bg-white/10 hover:scale-105 duration-200 border-[1px] border-white rounded-md flex items-center justify-center"
                >
                  <FaXTwitter />
                </a>
              )}
              {user?.website != "" && (
                <a
                  href={user?.website}
                  target="_blank"
                  className="w-8 h-8 text-xl bg-white/10 hover:scale-105 duration-200 border-[1px] border-white rounded-md flex items-center justify-center"
                >
                  <FaGlobeAmericas />
                </a>
              )}
              {user?.farcaster != "" && (
                <a
                  href={user?.farcaster}
                  target="_blank"
                  className="w-8 h-8 text-xl bg-white/10 hover:scale-105 duration-200 border-[1px] border-white rounded-md flex items-center justify-center"
                >
                  <SiFarcaster />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {user && publishedBooks.length == 0 ? (
        <div className="w-screen h-[25rem] flex items-center justify-center flex-col">
          <h2 className="text-xl font-bold">No Published books!</h2>
        </div>
      ) : (
        <>
          {/* PUBLISHED BOOKS */}
          <div className="flex flex-col items-start mt-8 justify-center md:px-10 px-4">
            <div className="flex items-center justify-center w-full mb-5">
              <div className="w-full flex items-start justify-start ">
                <h3 className="text-2xl font-bold ">Published</h3>
              </div>
            </div>

            {publishedBooks.map((item: any) => (
              <div className="w-full mb-5">
                <div className="w-full max-md:flex max-md:flex-wrap max-md:gap-6 items-center max-sm:justify-center sm:justify-start md:gap-2 md:grid md:grid-flow-col min-[1100px]:grid-cols-5 md:grid-cols-4 ">
                  {item.map((item2: any) => (
                    <div className="flex relative group flex-col items-center px-2 md:px-10 mt-2 justify-center gap-4">
                      <div
                        onClick={() => {
                          router.push("/books/" + item2._id);
                        }}
                        className="flex cursor-pointer gap-2 absolute bottom-0 pb-2 group-hover:opacity-100 opacity-0 h-20 duration-200 bg-gradient-to-b from-transparent z-50 max-md:w-[110%] max-md:translate-y-3 w-[80%]  text-white rounded-b-xl to-black/50 items-center justify-center"
                      >
                        <h2 className="font-semibold text-sm mt-5">
                          {item2.name.slice(0, 10)}
                          {item2.name.length > 10 && "..."}
                        </h2>
                      </div>
                      <button
                        onClick={() => {
                          router.push("/books/" + item2._id);
                        }}
                        className="md:w-40 md:h-68 w-32 max-md:h-44 flex flex-col cursor-pointer relative items-center hover:scale-105 hover:-translate-y-2 duration-200 justify-center "
                      >
                        <Book img={item2.cover} />
                      </button>
                    </div>
                  ))}
                </div>
                <div
                  className={`w-full h-5 max-md:hidden rounded-md shadow-xl shadow-black/30 bg-gradient-to-b duration-200 dark:from-[#313131] dark:to-[#232323] from-white to-gray-300 relative z-10`}
                ></div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
