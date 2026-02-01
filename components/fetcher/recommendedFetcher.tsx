"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Book from "../Global/Book";
import Icon from "../Global/Icon";
import { toast } from "react-toastify";
import { useGlobalContext } from "@/context/MainContext";
import { useSession } from "next-auth/react";
import { MdLibraryAddCheck } from "react-icons/md";
import { useLoading } from "../PageLoader/LoadingContext";
import OptionToggle from "../Global/OptionToggle";
import { FaExternalLinkAlt } from "react-icons/fa";
import Link from "next/link";

import moment from "moment";

export const RecommendedFetcher = () => {
  const router = useRouter();
  const pathname = usePathname();

  const { recentBooks, publishedBooks, boosted, night } = useGlobalContext();
  const [type, setType] = useState("Trending");

  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    if (window) {
      const handleResize = () => setScreenWidth(window?.innerWidth);
      window?.addEventListener("resize", handleResize);
      return () => window?.removeEventListener("resize", handleResize);
    }
  }, []);

  return (
    <div className="lg:px-5 px-4 flex gap-4 mt-8 flex-col items-start justify-center w-full pb-20">
      <div className="flex flex-col items-start justify-center w-full">
        {boosted && boosted.length > 0 && (
          <div className="mb-16 w-full">
            <div className="w-full my-2">
              <h3 className="text-2xl font-bold bg-gradient-to-b from-yellow-700 via-yellow-400 to-yellow-600 text-transparent bg-clip-text">
                <span className="text-black">Nifty</span> Picks ✨
              </h3>
            </div>

            <div className="w-full mb-5">
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-[1600px]:grid-cols-5 min-[2000px]:grid-cols-6 min-[2500px]:grid-cols-7 gap-6">
                {boosted.map((item: any, i) => (
                  <div
                    onClick={() => {
                      router.push("/books/" + item._id);
                    }}
                    className="flex cursor-pointer relative group items-start p-4 mt-2 justify-start gap-4 w-full dark:hover:bg-white dark:hover:text-black dark:text-white dark:bg-white/10 bg-nifty-gray-1/10 text-black hover:bg-black hover:text-white duration-200 border-white rounded-xl "
                  >
                    <button className="w-fit h-fit flex flex-col cursor-pointer relative items-center hover:-translate-y-2 duration-200 justify-center ">
                      <Book height={32} width={24} img={item.cover} />
                    </button>

                    <div className="flex flex-col h-full justify-start gap-2">
                      <h2 className="text-sm font-bold">{item.name}</h2>
                      <h2 className="text-xs">
                        {item.description.slice(
                          0,
                          screenWidth < 1024
                            ? 50
                            : screenWidth < 1280
                              ? 75
                              : 100,
                        )}
                        {item.description.length >
                          (screenWidth < 1024
                            ? 50
                            : screenWidth < 1280
                              ? 75
                              : 100) && "..."}
                      </h2>
                    </div>
                  </div>
                ))}
              </div>
              <div className="w-full h-5 max-lg:hidden rounded-md shadow-xl shadow-black/30 bg-gradient-to-b from-white to-gray-300 relative z-10"></div>
            </div>
          </div>
        )}

        <div className="w-full">
          <h3 className="text-2xl font-bold">Library</h3>
        </div>

        <div className="mb-5">
          <OptionToggle
            options={["Trending", "Latest"]}
            selectedOption={type}
            setOption={setType}
          />
        </div>

        {type == "Trending" && recentBooks && recentBooks.length > 0 && (
          <div className="w-full mb-5">
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-[1600px]:grid-cols-5 min-[2000px]:grid-cols-6 min-[2500px]:grid-cols-7 gap-6">
              {recentBooks.map((item: any, i) => (
                <div
                  onClick={() => {
                    router.push("/books/" + item._id);
                  }}
                  className="flex cursor-pointer relative group items-start p-4 mt-2 justify-start gap-4 w-full dark:hover:bg-white dark:hover:text-black dark:text-white dark:bg-white/10 bg-nifty-gray-1/10 text-black hover:bg-black hover:text-white duration-200 border-white rounded-xl "
                >
                  <button className="w-fit h-fit flex flex-col cursor-pointer relative items-center hover:-translate-y-2 duration-200 justify-center ">
                    <Book height={32} width={24} img={item.cover} />
                  </button>

                  <div className="flex flex-col h-full justify-start gap-2">
                    <h2 className="text-sm font-bold">{item.name}</h2>
                    <h2 className="text-xs">
                      {item.description.slice(
                        0,
                        screenWidth < 1024 ? 50 : screenWidth < 1280 ? 75 : 100,
                      )}
                      {item.description.length >
                        (screenWidth < 1024
                          ? 50
                          : screenWidth < 1280
                            ? 75
                            : 100) && "..."}
                    </h2>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {type == "Latest" && publishedBooks && publishedBooks.length > 0 && (
          <div className="w-full mb-5">
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-[1600px]:grid-cols-5 min-[2000px]:grid-cols-6 min-[2500px]:grid-cols-7 gap-6">
              {publishedBooks.map((item: any, i) => (
                <div
                  onClick={() => {
                    router.push("/books/" + item._id);
                  }}
                  className="flex cursor-pointer relative group items-start p-4 mt-2 justify-start gap-4 w-full dark:hover:bg-white dark:hover:text-black dark:text-white dark:bg-white/10 bg-nifty-gray-1/10 text-black hover:bg-black hover:text-white duration-200 border-white rounded-xl "
                >
                  <button className="w-fit h-fit flex flex-col cursor-pointer relative items-center hover:-translate-y-2 duration-200 justify-center ">
                    <Book height={32} width={24} img={item.cover} />
                  </button>

                  <div className="flex flex-col h-full justify-start gap-2">
                    <h2 className="text-sm font-bold">{item.name}</h2>
                    <h2 className="text-xs">
                      {item.description.slice(
                        0,
                        screenWidth < 1024 ? 50 : screenWidth < 1280 ? 75 : 100,
                      )}
                      {item.description.length >
                        (screenWidth < 1024
                          ? 50
                          : screenWidth < 1280
                            ? 75
                            : 100) && "..."}
                    </h2>
                  </div>
                </div>
              ))}
            </div>
            {/* <div className={`w-full h-5 max-lg:hidden rounded-md shadow-xl shadow-black/30 bg-gradient-to-b duration-200 dark:from-[#313131] dark:to-[#232323] from-white to-gray-300 relative z-10`}>
                  </div> */}
          </div>
        )}
      </div>
    </div>
  );
};
