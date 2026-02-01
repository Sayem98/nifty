"use client";

import Highlights from "@/components/Explore/Highlights";
import PublicLibrary from "@/components/Explore/PublicLibrary";
import Navbar from "@/components/Home/Navbar";
import { useLoading } from "@/components/PageLoader/LoadingContext";
import { useGlobalContext } from "@/context/MainContext";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaEdit, FaPen } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import Image, { StaticImageData } from "next/image";
import logo from "@/assets/profileImg.png";
import { toast } from "react-toastify";
import { useAccount, useEnsName } from "wagmi";
import { AiOutlineLoading } from "react-icons/ai";
import { RecommendedFetcher } from "@/components/fetcher/recommendedFetcher";
import { RiLoader5Fill } from "react-icons/ri";
import TxnFetcher from "@/components/fetcher/txnFetcher";

const Explore = () => {
  return (
    <div
      className={` dark:text-white dark:bg-nifty-black text-black bg-white duration-200 min-h-screen`}
    >
      <Highlights />
      <RecommendedFetcher />
      {/* <TxnFetcher/> */}
    </div>
  );
};

export default Explore;
