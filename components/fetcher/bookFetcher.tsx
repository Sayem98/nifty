"use client";

import React from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import abi from "@/utils/abis/templateABI";
import { RecommendedFetcher } from "@/components/fetcher/recommendedFetcher";
import { useGlobalContext } from "@/context/MainContext";
import {
  FaBookOpen,
  FaCrown,
  FaInfinity,
  FaLocationArrow,
  FaPause,
  FaPlay,
} from "react-icons/fa";
import Book from "@/components/Global/Book";
import { signOut, useSession } from "next-auth/react";
import { TiMinus, TiPlus } from "react-icons/ti";
import { AiOutlineLoading } from "react-icons/ai";
import Icon from "@/components/Global/Icon";
import { toast } from "react-toastify";
import { MdLibraryAddCheck, MdReport } from "react-icons/md";
import { useLoading } from "@/components/PageLoader/LoadingContext";
import { SiOpensea } from "react-icons/si";
import { CiShare2 } from "react-icons/ci";
import { RiLoader5Line } from "react-icons/ri";
import { useAccount, useChainId, useEnsName } from "wagmi";
import { ImCross, ImPause } from "react-icons/im";
import { WalletConnectButton } from "../buttons/WalletConnectButton";
import masterABI from "@/utils/abis/masterABI";
import ReactAudioPlayer from "react-audio-player";
import { WalletConnectRegister } from "../buttons/WalletConnectRegister";

export const BookFetcher = () => {
  const pathname = usePathname();

  const router = useRouter();
  const { address } = useAccount();
  const { data: session, status: sessionStatus } = useSession();

  const { data: ensName } = useEnsName({ address: address });

  const [readListed, setReadListed] = useState<boolean>(false);
  const [bookDetails, setBookDetails] = useState<BookType>();
  const [price, setPrice] = useState<string>("0");
  const { user, getUser, night } = useGlobalContext();
  const [userDetails, setUserDetails] = useState<UserType>();
  const [amount, setAmount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ethPrice, setEthPrice] = useState(0);
  const [loadingHolders, setLoadingHolders] = useState(false);
  const [holders, setHolders] = useState([]);
  const [userMinted, setUserMinted] = useState<number>(0);

  const [platformFee, setPlatformFee] = useState<number>(0);

  const [song, setSong] = useState<HTMLAudioElement>();

  async function getBookDetails() {
    try {
      await axios.get("/api/book/" + pathname.split("/")[2]).then((res) => {
        setBookDetails(res.data.data);
        setUserDetails(res.data.user);
      });
    } catch (err) {
      console.log(err);
    }
  }

  async function getFeePerMint() {
    try {
      //@ts-ignore
      const add = "0xBA334807c9b41Db493cD174aaDf3A8c7E8a823AF";

      //@ts-ignore
      const provider = new ethers.getDefaultProvider(
        "https://base-mainnet.g.alchemy.com/v2/2L082LzB4Kl82BLjvBpMBgEnz3eTuq1v"
      );

      //@ts-ignore
      const contract = new ethers.Contract(add, masterABI, provider);

      const fee = await contract.getFeePerMint();

      setPlatformFee(Number(ethers.utils.formatEther(fee)));
    } catch (err) {
      console.log(err);
    }
  }

  async function contractSetup() {
    try {
      //@ts-ignore
      if (typeof window?.ethereum !== "undefined" && address) {
        //@ts-ignore
        const provider = new ethers.providers.Web3Provider(window?.ethereum);
        const signer = provider.getSigner();

        const network = await provider.getNetwork();

        const isBase = network.chainId === 8453;

        if (!isBase) {
          setShowModal(false);
          toast.error("Not connected to Base network");
          setLoading(false);
          return null;
        }

        // console.log(bookDetails?.contractAddress)
        //@ts-ignore
        const contract = new ethers.Contract(
          bookDetails?.contractAddress || "",
          abi,
          signer
        );

        return contract;
      }
    } catch (err) {
      setLoading(false);

      console.log(err);
    }
  }

  async function fetcherContractSetup() {
    try {
      //@ts-ignore
      const provider = new ethers.getDefaultProvider(
        "https://base-mainnet.g.alchemy.com/v2/2L082LzB4Kl82BLjvBpMBgEnz3eTuq1v"
      );

      //@ts-ignore
      const contract = new ethers.Contract(
        bookDetails?.contractAddress || "",
        abi,
        provider
      );

      return contract;
    } catch (err) {
      setLoading(false);

      console.log(err);
    }
  }

  const chainId = useChainId();

  async function mint() {
    if (chainId !== 8453) {
      toast.error("Please switch to Base Mainnet to mint");
      return;
    }
    try {
      const contract = await contractSetup();

      // Calculate the value to send with the transaction
      const valueToSend = ethers.utils.parseEther(
        String(
          (((bookDetails?.price as number) + platformFee) * amount).toFixed(4)
        )
      );

      // Estimate gas
      const gasEstimate = await contract?.estimateGas.mint(
        amount,
        bookDetails?.tokenId,
        { value: valueToSend }
      );

      // Add a 20% buffer to the gas estimate
      const gasLimit = gasEstimate?.mul(130).div(100);

      // Get current gas price
      const gasPrice = await contract?.provider.getGasPrice();

      // Execute the transaction with the estimated gas
      const txn = await contract?.mint(amount, bookDetails?.tokenId, {
        value: valueToSend,
        gasLimit: gasLimit,
        gasPrice: gasPrice,
      });

      await txn?.wait();

      //@ts-ignore
      if (txn && session.role != "ANONYMOUS") {
        //@ts-ignore
        await axios.patch("/api/book/updateMinted/" + pathname.split("/")[2], {
          minted: bookDetails ? bookDetails.minted! + amount : 0,
        });
        await axios
          .post("/api/transaction/create", {
            txnHash: txn.hash,
            bookId: pathname.split("/")[2],
            userId: user?._id,
            amount: amount,
            value: (bookDetails?.price as number) * amount,
          })
          .then(async (res) => {
            getBookDetails();
            setShowModal(false);
            setLoading(false);
          })
          .catch((err) => {
            console.log(err);
          });
      }

      // @ts-ignore
      if (txn && session.role == "ANONYMOUS") {
        //@ts-ignore
        await axios.patch("/api/book/updateMinted/" + pathname.split("/")[2], {
          minted: bookDetails?.minted! + amount,
        });
        const res = await axios
          .post("/api/user/create", {
            wallet: address,
            username: ensName || `${address?.slice(0, 5)}-wallet`,
            mintedBook: [pathname.split("/")[2]],
          })
          .catch((err) => {
            console.log(err);
          });
        await axios
          .post("/api/transaction/create", {
            txnHash: txn.hash,
            bookId: pathname.split("/")[2],
            userId: res?.data.user?._id,
            amount: amount,
            value: (bookDetails?.price as number) * amount,
          })
          .then(async (res) => {
            getBookDetails();
            setShowModal(false);
            setLoading(false);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } catch (err: any) {
      if (err?.data?.message.includes("insufficient")) {
        toast.error("Insufficient funds for transaction");
      } else if (err?.code == "ACTION_REJECTED") {
        toast.error("You rejected the transaction!");
      } else {
        toast.error("Error while minting. Try again!");
      }
      setShowModal(false);
      setLoading(false);
      console.log(err);
    }
  }

  useEffect(() => {
    getBookDetails();
    getFeePerMint();
  }, []);

  async function setMintPrice() {
    try {
      const contract = await fetcherContractSetup();

      console.log(contract);

      const price = ethers.utils.formatEther(
        String(await contract?.tokenIdPrice(bookDetails?.tokenId))
      );
      if (address) {
        const minted = await contract?.tokenIdMintedByAddress(
          bookDetails?.tokenId,
          address
        );
        setUserMinted(Number(minted));
      }

      setPrice(price);
    } catch (err) {
      console.log(err);
    }
  }

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function fetchHolders() {
    try {
      setLoadingHolders(true);
      const contract = await fetcherContractSetup();
      const holders = await contract?.returnHolders(bookDetails?.tokenId);

      var arr: any = [];

      if (holders.length > 0) {
        holders.map((item: any) => {
          arr.push(item[0]);
        });

        const res = await axios.post("/api/getAllUsers", { array: arr });

        var arr1: any = [];

        res.data.arr.map((item: any, i: number) => {
          const username = item?.username;
          const image = item?.profileImage;
          const holding = Number(holders[i][1]);

          if (username) {
            arr1.push({ username, holding, image });
          }
        });

        arr1.sort((a: any, b: any) => b.holding - a.holding);

        setHolders(arr1);
      }
      setLoadingHolders(false);
    } catch (err) {
      fetchHolders();
      await delay(500);
      setLoadingHolders(false);
      console.log(err);
    }
  }

  useEffect(() => {
    if (bookDetails) {
      fetchHolders();

      setSong(new Audio(bookDetails.audiobook));
    }
  }, [bookDetails]);

  const readlist = async (id: string) => {
    try {
      await axios
        .post("/api/readlist", { email: session?.user?.email, bookId: id })
        .then((res) => {
          // console.log(res.data.user, res.data.book);
          toast.success("Added to Readlist!");
          getUser();
          getBookDetails();
        });
    } catch (err: any) {
      if (err.response.status == 501) {
        toast.error(err.response.data.error);
      } else {
        toast.error("Error while adding to readlist");
      }
    }
  };

  useEffect(() => {
    user?.readlist?.map((item: any) => {
      if (item?._id == bookDetails?._id) {
        setReadListed(true);
      }
    });
  }, [user, bookDetails]);

  useEffect(() => {
    if (bookDetails) setMintPrice();
  }, [bookDetails, address]);

  function setLocalStorage() {
    if (userDetails) {
      localStorage?.setItem("address", userDetails?.wallet as string);
    }

    if (bookDetails) {
      console.log(bookDetails);
      localStorage?.setItem("book", JSON.stringify(bookDetails));
    }

    router.push("/read");
  }

  const getTickerPrice = async () => {
    try {
      const priceFetch = await fetch(
        `https://api.binance.us/api/v3/ticker/price?symbol=ETHUSDT`
      );
      const priceBody = await priceFetch.json();
      setEthPrice(Math.round(priceBody.price));
    } catch (error) {
      console.error("Error", error);
      throw error;
    }
  };

  useEffect(() => {
    getTickerPrice();
  }, []);

  // async function tokenChecker() {
  //   try {
  //     const res = await axios.get("/api/tokenChecker");
  //     // console.log(res.data);
  //   } catch (error) {
  //     if (axios.isAxiosError(error) && error.response?.status === 401) {
  //       router.push('/connect');
  //     } else {
  //       console.error("An error occurred:", error);
  //     }
  //   }
  // }

  const [created, setCreated] = useState("");

  useEffect(() => {
    if (bookDetails) {
      const date = new Date(String(bookDetails?.createdAt));
      setCreated(
        String(date.getMonth() + 1) +
          "/" +
          String(date.getDate()) +
          "/" +
          String(date.getFullYear())
      );
    }
  }, [bookDetails]);

  // useEffect(() => {
  //   tokenChecker();
  // }, []);

  const [openReportModal, setOpenReportModal] = useState(false);
  const [tags, setTags] = useState<Array<string>>([]);

  const defaultTags: Array<string> = [
    "Inappropriate Content",
    "Hate Speech",
    "Graphic Violence",
    "Pornographic",
    "Plagiarism",
  ];

  const removeTag = (indexToRemove: number) => {
    setTags((prevTags) =>
      prevTags.filter((_, index) => index !== indexToRemove)
    );
  };

  async function makeReport() {
    try {
      if (tags.length == 0) {
        toast.error("Select a tag!");
        return;
      }
      await axios
        .post("/api/book/report", {
          bookId: pathname.split("/")[2],
          email: user?.email,
          tag: tags[0],
        })
        .then((res: any) => {
          console.log(res);
          toast.success("Reported book!");
          setOpenReportModal(false);
        });
    } catch (err: any) {
      console.log(err);
      if (err.response.status == 501) {
        toast.error(err.response.data.error);
      } else {
        toast.error("Error while making report");
      }
      setOpenReportModal(false);
    }
  }

  async function increaseReader(num: number, id: any) {
    try {
      await axios.patch("/api/book/" + id, { readers: num + 1 }).then((res) => {
        console.log(res);
      });
    } catch (err) {
      console.log(err);
    }
  }

  const [exists, setExists] = useState<boolean>(false);

  async function checkExistingUser() {
    try {
      const res = await axios.get("/api/user/wallet/" + address);
      if (res.data.user) {
        setExists(true);
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    //@ts-ignore
    if (address && session?.role == "ANONYMOUS") {
      checkExistingUser();
    }
  }, [address]);

  const [play, setPlay] = useState(false);
  const [progress, setProgress] = useState("w-[0%]");
  var interval: any;

  useEffect(() => {
    console.log(song?.duration);
    console.log(song?.currentTime);
    if (song?.duration) {
      if (progress == "w-[0%]") {
        setInterval(() => {
          //@ts-ignore
          const percent = ((song?.currentTime / song?.duration) * 15).toFixed(
            1
          );
          const width = `w-[${percent}rem]`;
          console.log(width);
          setProgress(width);
        }, 3000);
      }
      if (play) {
        song?.play();
      } else {
        song?.pause();
      }
    }
  }, [play]);

  // useEffect(()=>{
  //   // if(song?.currentTime && song?.duration){
  //   // @ts-ignore
  //     const percent = Math.round((song?.currentTime/song?.duration)*100);
  //     console.log(percent);
  //     setProgress(`w-[${percent}%]`)
  //   // }
  // },[song.])

  return (
    <>
      <div
        className={`dark:bg-nifty-black dark:text-white bg-white text-black duration-200`}
      >
        <div
          className={`w-screen h-screen fixed top-0 left-0 z-[-1] dark:bg-nifty-black bg-white`}
        ></div>

        {/* WARNING MODAL */}
        {/* <div className={` ${exists ? "-translate-y-0" : "translate-y-[300rem]"} duration-200 backdrop-blur-xl w-screen h-screen fixed top-0 left-0 z-[1000] flex items-center justify-center`}>
          <button onClick={() => { signOut() }} className='w-40 bg-nifty-white font-semibold absolute h-10 rounded-lg hover:-translate-y-1 duration-200 top-4 right-4 text-black'>Sign Out</button>
          <div className={`w-80 dark:bg-[#313131] bg-white  shadow-xl shadow-black/30 rounded-xl p-4 font-semibold`}>
            <h2 className='text-md'>You've connected <span className=' font-bold '>{address?.slice(0, 7)}...{address?.slice(address.length - 5, address.length)}</span> which is connected to an account.</h2>
            <h2 className='text-sm my-2 text-nifty-gray-1'>Please Sign Out and login via Metamask.</h2>
          </div>
        </div> */}

        {/* REPORT MODAL */}
        {openReportModal && (
          <div
            className={` duration-200 h-screen w-screen backdrop-blur-xl fixed top-0 left-0 z-[500] flex items-center justify-center`}
          >
            <div
              className={`w-80 rounded-xl shadow-xl shadow-black/30 dark:bg-[#313131] bg-white p-4`}
            >
              <div className="flex ">
                <h2 className="text-xl font-bold w-1/2">Report Book</h2>
                <button
                  onClick={() => {
                    setOpenReportModal(false);
                  }}
                  className="text-black hover:text-red-500 duration-200 w-1/2 flex justify-end items-center"
                >
                  <ImCross />
                </button>
              </div>
              <div className="mt-4">
                <h2 className="text-sm text-nifty-gray-2">Select a reason:</h2>
                <div className="w-full text-start flex flex-col">
                  <div className="flex flex-wrap items-center justify-center gap-1 my-2">
                    {defaultTags.map((item: string) => (
                      <button
                        disabled={tags.length == 1}
                        onClick={() => {
                          if (!tags.includes(item))
                            setTags((prev) => [...prev, item]);
                        }}
                        className={`py-2 min-w-32 px-2 hover:scale-105 duration-200 ${
                          tags.includes(item) && "brightness-125"
                        } hover:brightness-105 rounded-xl flex gap-2 items-center justify-center ${
                          tags.length == 5 && "opacity-60"
                        } bg-gray-300 border-2 border-gray-500 font-semibold text-center text-gray-500 text-xs`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((item, i) => (
                      <div className="py-2 min-w-20 px-2 rounded-xl flex gap-2 items-center justify-center bg-gray-300 border-2 border-gray-500 font-semibold text-center text-gray-500 text-xs">
                        {item}
                        <button
                          onClick={() => {
                            removeTag(i);
                          }}
                          className="hover:text-white duration-200"
                        >
                          <ImCross />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => {
                    makeReport();
                  }}
                  className="w-full h-10 mt-4 text-lg font-bold hover:-translate-y-1 duration-200 bg-black text-white rounded-lg"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MINTING MODAL */}
        {showModal && (
          <>
            <div
              className={`fixed h-screen w-screen backdrop-blur-xl duration-500 top-0 left-0 flex flex-col z-[10000] items-center justify-center`}
            >
              <div
                className={`dark:bg-[#313131] bg-white rounded-xl flex flex-col shadow-xl w-80 shadow-black/30 gap-4 justify-center items-start p-5`}
              >
                <h2 className="text-2xl font-bold leading-tight">Mint</h2>
                <h2 className="text-lg text-nifty-gray-1">
                  Choose number of mints
                </h2>

                <div className="flex rounded-xl items-center justify-center gap-4 w-full h-28 border-[1px] border-gray-300">
                  <button
                    onClick={() => {
                      if (amount != 0) {
                        setAmount((prev) => prev - 1);
                      }
                    }}
                    className="hover:scale-105 duration-200"
                  >
                    <TiMinus
                      className={`text-2xl dark:text-white text-black`}
                    />
                  </button>
                  <h3 className="text-2xl font-bold w-24 text-center">
                    {amount}
                  </h3>
                  <button
                    onClick={() => {
                      //@ts-ignore
                      if (
                        (bookDetails?.maxMint == 0 ||
                          (bookDetails?.minted as number) + amount !=
                            bookDetails?.maxMint) &&
                        (bookDetails?.maxMintsPerWallet == 0 ||
                          userMinted + amount != bookDetails?.maxMintsPerWallet)
                      ) {
                        setAmount((prev) => prev + 1);
                      } else {
                        setAmount((prev) => prev);
                      }
                    }}
                    className="hover:scale-105 duration-200"
                  >
                    <TiPlus
                      className={`text-2xl dark:text-white text-black rotate-180`}
                    />
                  </button>
                </div>
                <div className="text-nifty-gray-1 w-full">
                  <div className="w-full flex">
                    <h2 className="w-1/3 text-[0.85rem]">Book Price</h2>
                    <h2 className="w-2/3 text-[0.85rem] font-semibold text-end text-nowrap">
                      {(Number(price) * amount).toFixed(4)} ETH ($
                      {(amount * ethPrice * Number(price)).toFixed(2)})
                    </h2>
                  </div>
                  <div className="w-full flex my-2">
                    <h2 className="w-1/2 text-[0.7rem]">Platform Fee</h2>
                    <h2 className="w-1/2 text-[0.7rem] font-semibold text-end">
                      {(platformFee * amount).toFixed(4)} ETH ($
                      {(amount * ethPrice * platformFee).toFixed(2)})
                    </h2>
                  </div>

                  <div
                    className={`w-full dark:text-white text-blackfont-bold flex mb-2 mt-4`}
                  >
                    <h2 className="w-1/2 text-[0.85rem] font-bold">Total</h2>
                    <h2 className="w-1/2 text-[0.85rem] font-bold text-end text-nowrap">
                      {((platformFee + Number(price)) * amount).toFixed(4)} ETH
                      ($
                      {(
                        amount *
                        ethPrice *
                        (platformFee + Number(price))
                      ).toFixed(2)}
                      )
                    </h2>
                  </div>
                </div>
                <div className="flex gap-2 items-center flex-col justify-center w-full">
                  {/* @ts-ignore */}
                  {user || session?.walletAddress ? (
                    <button
                      disabled={loading}
                      onClick={() => {
                        setLoading(true);
                        mint();
                      }}
                      className="w-64 h-12 py-1 px-3 flex items-center justify-center rounded-lg text-white font-bold hover:-translate-y-1 duration-200 bg-black"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-4">
                          <AiOutlineLoading className="text-white text-xl animate-spin" />{" "}
                          <h2>Collecting</h2>
                        </div>
                      ) : (
                        "Collect"
                      )}
                    </button>
                  ) : (
                    <WalletConnectRegister />
                  )}
                  <button
                    disabled={loading}
                    onClick={() => {
                      setLoading(false);
                      setShowModal(false);
                    }}
                    className="text-black bg-gray-200 h-12 w-64 font-bold rounded-lg hover:-translate-y-1 px-3 py-1 transform transition duration-200 ease-in-out flex items-center justify-center flex-col gap-0"
                  >
                    Cancel
                  </button>

                  {/* @ts-ignore */}
                  {session?.role == "ANONYMOUS" && (
                    <h3 className="w-full text-nifty-gray-1 text-xs mt-2 text-center">
                      An account will be created <b>with this wallet</b> and you
                      will be logged out automatically on completion of the
                      mint.
                    </h3>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        <div className="w-screen relative h-[47rem] md:h-[22rem] flex items-center justify-center overflow-hidden object-fill ">
          <div className="absolute flex gap-2 items-center justify-center top-0 bg-white/10 px-4 py-2 z-[100] text-white font-semibold max-md:rounded-b-xl md:right-0 rounded-bl-xl border-b-[1px] md:border-l-[1px] border-white">
            <span className="border-r-[1px] pr-2 border-white text-white">
              Views: {bookDetails?.readers}
            </span>
            <h2>
              Minted: {bookDetails?.minted ? bookDetails.minted : 0}
              {bookDetails?.maxMint != 0 && "/" + bookDetails?.maxMint}
            </h2>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `${process.env.NEXTAUTH_URL}/books/` + pathname.split("/")[2]
              );
              toast.success("Successfully copied link!");
            }}
            className="absolute bottom-0 right-0 bg-white/10 px-4 py-2 z-[100] text-white font-semibold md:right-0 rounded-tl-xl border-t-[1px] hover:bg-white/20 duration-200 border-l-[1px] border-white"
          >
            <CiShare2 />
          </button>

          {user && address && (
            <button
              onClick={() => {
                setOpenReportModal(true);
              }}
              className="absolute top-0 left-0 bg-white/10 px-4 py-2 z-[100] text-white font-semibold md:left-0 rounded-br-xl border-b-[1px] hover:bg-white/20 duration-200 border-r-[1px] border-white"
            >
              <MdReport className="text-white text-xl" />
            </button>
          )}

          <div className="w-screen absolute h-full overflow-hidden">
            {bookDetails?.cover && (
              <Image
                width={1080}
                height={1080}
                src={bookDetails?.cover || ""}
                alt="dp"
                className="w-full h-full object-cover object-center absolute top-1/2 left-1/2 transform -translate-x-1/2 brightness-75 -translate-y-1/2"
              />
            )}
          </div>

          <div className="flex max-md:flex-col gap-8 object-center items-center max-md:py-10 md:h-full h-full md:px-10 w-screen justify-center md:justify-start my-auto absolute z-50 backdrop-blur-xl">
            <div className="flex object-center items-center md:h-full md:px-10 md:w-60 h-full justify-center md:justify-start my-auto">
              <div className="w-fit h-fit relative hover:brightness-105 duration-150">
                <div className="bg-nifty-gray-1 overflow-hidden rounded w-48 h-64 shadow-black/50 shadow relative z-10">
                  {bookDetails?.cover && (
                    <Image
                      width={1080}
                      height={1080}
                      src={bookDetails?.cover}
                      alt="bookcover"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="bg-white rounded w-48 h-64 shadow-black/20 shadow-md absolute top-1 left-1 z-0"></div>
                <div className="bg-white rounded w-48 h-64 shadow-book absolute top-1 left-1 z-0"></div>
              </div>
            </div>
            <div className="flex flex-col max-md:items-center max-md:justify-center gap-3 md:w-[50%] max-md:w-[90%] ">
              <div className="flex flex-col gap-2 md:items-start md:justify-start items-center justify-center">
                <div className="flex items-center justify-center max-md:flex-col gap-4">
                  <h3 className="text-3xl text-white font-bold flex max-md:flex-col md:hidden items-center justify-center text-center gap-2">
                    {bookDetails?.name.slice(0, 20)}
                    {bookDetails?.name &&
                      bookDetails?.name?.length > 20 &&
                      "..."}
                  </h3>
                  <h3 className="text-3xl text-white font-bold flex max-md:flex-col max-md:hidden items-center gap-2">
                    {bookDetails?.name}
                  </h3>

                  {user && address && (
                    <div className="flex gap-2">
                      <button
                        disabled={readListed}
                        onClick={() => {
                          readlist(bookDetails?._id as string);
                        }}
                        className="bg-black h-10 w-10 flex hover:-translate-y-1 duration-200 items-center justify-center rounded-lg"
                      >
                        {!readListed ? (
                          <Icon
                            name="addread"
                            className="w-5 pl-1 mt-1"
                            color="white"
                          />
                        ) : (
                          <MdLibraryAddCheck className="text-green-500" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    router.push("/authors/" + userDetails?.wallet);
                  }}
                  className=" text-sm flex text-semibold gap-2 text-white"
                >
                  Belongs to:{" "}
                  <span className="font-bold flex items-center justify-center gap-1">
                    {userDetails?.collectionName}
                    <FaBookOpen />
                  </span>
                </button>
              </div>
              <p className="text-sm text-white max-md:text-center">
                {bookDetails?.description?.substring(0, 250)}
                {(bookDetails?.description?.length as number) > 250 && "..."}
              </p>
              <div className="flex flex-wrap gap-2">
                {bookDetails?.tags?.map((item) => (
                  <div className="min-w-20 px-2 py-2 bg-white/10 flex items-center justify-center text-white text-xs font-semibold border-[1px] border-white rounded-lg">
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  className="w-32 h-10 py-1 px-3 flex items-center justify-center rounded-lg text-white font-bold hover:-translate-y-1 duration-200 bg-black"
                  onClick={() => {
                    setLocalStorage();
                    increaseReader(
                      bookDetails?.readers as number,
                      bookDetails?._id
                    );
                  }}
                >
                  Read
                </button>
                {/* @ts-ignore */}
                <button
                  disabled={
                    (bookDetails?.maxMint! > 0 &&
                      bookDetails?.maxMint == bookDetails?.minted) ||
                    bookDetails?.isPaused
                  }
                  onClick={() => {
                    setShowModal(true);
                  }}
                  className="text-black bg-gray-200 h-10 w-32 font-bold rounded-lg hover:-translate-y-1 px-3 py-1 transform transition duration-200 ease-in-out flex items-center justify-center flex-col gap-0"
                >
                  {bookDetails?.isPaused && (
                    <h2 className="flex gap-2 items-center justify-center">
                      Paused <FaPause />
                    </h2>
                  )}
                  {bookDetails?.maxMint! > 0 &&
                    bookDetails?.minted! < bookDetails?.maxMint! &&
                    !bookDetails?.isPaused &&
                    "Mint"}{" "}
                  {bookDetails?.maxMint! > 0 &&
                    bookDetails?.minted! >= bookDetails?.maxMint! &&
                    "Minted Out!"}{" "}
                  {bookDetails?.maxMint == 0 &&
                    !bookDetails?.isPaused &&
                    "Collect"}
                </button>
                {bookDetails && (bookDetails?.minted as number) > 0 && (
                  <a
                    target="_blank"
                    className="w-10 h-10 py-1 px-2 flex items-center justify-center text-xl rounded-lg font-bold hover:-translate-y-1 duration-200 bg-[#2181e3] text-white"
                    href={`https://opensea.io/assets/base/${bookDetails.contractAddress}/${bookDetails.tokenId}`}
                  >
                    <SiOpensea />
                  </a>
                )}
              </div>
              <div>
                {bookDetails?.audiobook !== "" && (
                  <div className="w-80">
                    <ReactAudioPlayer
                      src={bookDetails?.audiobook}
                      controls
                      style={{ color: "black", backgroundColor: "transparent" }}
                    />
                    <style jsx>{`
  div :global(audio) {
    width: 100%;
    height: 40px;
  }

  
  div :global(audio::-webkit-media-controls-panel) {
    border-radius: 4px; /* Making the overall panel less round */
  }
  
  div :global(audio::-webkit-media-controls-play-button),
  div :global(audio::-webkit-media-controls-mute-button) {
    border-radius: 2px; /* Making buttons less round */
  }
  
  div :global(audio::-webkit-media-controls-current-time-display),
  div :global(audio::-webkit-media-controls-time-remaining-display),
  div :global(audio::-webkit-media-controls-timeline),
  div :global(audio::-webkit-media-controls-volume-slider-container),
  div :global(audio::-webkit-media-controls-volume-slider),
  div :global(audio::-webkit-media-controls-seek-back-button),
  div :global(audio::-webkit-media-controls-seek-forward-button),
  div :global(audio::-webkit-media-controls-fullscreen-button),
  div :global(audio::-webkit-media-controls-rewind-button),
  div :global(audio::-webkit-media-controls-return-to-realtime-button),
`}</style>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 mt-5">
          <div className="w-full max-w-full overflow-x-auto mx-auto mb-10 flex max-md:flex-col gap-5">
            <div className="md:w-1/3 w-full">
              <h2 className="text-2xl font-bold mb-2">Details</h2>
              <div className="bg-nifty-gray-1/30 w-full flex flex-col items-start justify-center rounded-xl p-6">
                <div className="flex gap-3 w-full">
                  <div className="w-1/2">
                    <h2 className="text-nifty-gray-2 font-bold text-sm">
                      Published On
                    </h2>
                    <h2
                      className={`dark:text-white text-blackfont-semibold text-lg`}
                    >
                      {created}
                    </h2>
                  </div>

                  <div className="w-1/2">
                    <h2 className="text-nifty-gray-2 font-bold text-sm">
                      Mint Price
                    </h2>
                    <h2
                      className={`dark:text-white text-blackfont-semibold text-lg`}
                    >
                      {(bookDetails?.price as number) > 0
                        ? bookDetails?.price + " ETH"
                        : "Free Mint"}
                    </h2>
                  </div>
                </div>

                <div className="flex gap-3 w-full mt-2">
                  <div className="w-1/2">
                    <h2 className="text-nifty-gray-2 font-bold text-sm">
                      ISBN
                    </h2>
                    <h2
                      className={`dark:text-white text-blackfont-semibold text-lg`}
                    >
                      {bookDetails?.ISBN ? (
                        bookDetails?.ISBN
                      ) : (
                        <div className="h-8 w-full rounded-lg bg-nifty-gray-1/30"></div>
                      )}
                    </h2>
                  </div>
                  <div className="w-1/2">
                    <h2 className="text-nifty-gray-2 font-bold text-sm">
                      Illustration Artist
                    </h2>
                    <h2
                      className={`dark:text-white text-blackfont-semibold text-lg`}
                    >
                      {bookDetails?.artist ? (
                        bookDetails?.artist.slice(0, 15)
                      ) : (
                        <div className="h-8 w-full rounded-lg bg-nifty-gray-1/30"></div>
                      )}
                    </h2>
                  </div>
                </div>

                <div className="flex gap-3 w-full mt-2">
                  <div className="w-1/2">
                    <h2 className="text-nifty-gray-2 font-bold text-sm">
                      Wallet Limit
                    </h2>
                    <h2
                      className={`dark:text-white text-blackfont-semibold text-lg`}
                    >
                      {bookDetails?.maxMintsPerWallet != 0 ? (
                        bookDetails?.maxMintsPerWallet
                      ) : (
                        <div className="h-8 w-full rounded-lg bg-nifty-gray-1/30"></div>
                      )}
                    </h2>
                  </div>
                  <div className="w-1/2">
                    <h2 className="text-nifty-gray-2 font-bold text-sm">
                      Supply
                    </h2>
                    <h2
                      className={`dark:text-white text-blackfont-semibold text-lg`}
                    >
                      {bookDetails?.maxMint != 0 ? (
                        bookDetails?.maxMint
                      ) : (
                        <FaInfinity />
                      )}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-2/3 w-full">
              <h2 className="text-2xl font-bold mb-2">Collectors</h2>
              <div className="overflow-x-auto ">
                <div className=" w-[100%]">
                  <div className="border-[1px] rounded-t-lg border-gray-300">
                    <div className="flex text-center py-2 bg-nifty-gray-1/20 ">
                      <div
                        className={`flex-shrink-0 w-[35%] font-semibold text-md max-md:text-sm dark:text-nifty-gray-1 text-black`}
                      >
                        <h2>Rank</h2>
                      </div>
                      <div
                        className={`flex-shrink-0 w-[15%] font-semibold text-md max-md:text-sm dark:text-nifty-gray-1 text-black`}
                      >
                        <h2></h2>
                      </div>
                      <div
                        className={`flex-shrink-0 w-[15%] font-semibold text-md max-md:text-sm dark:text-nifty-gray-1 text-black`}
                      >
                        <h2>Username</h2>
                      </div>
                      <div
                        className={`flex-shrink-0 w-[35%] font-semibold text-md max-md:text-sm dark:text-nifty-gray-1 text-black`}
                      >
                        <h2>Collected</h2>
                      </div>
                    </div>
                  </div>

                  <div className="border-x-[1px] border-b-[1px] rounded-b-lg border-gray-300 h-[10.5rem] overflow-y-scroll">
                    {loadingHolders ? (
                      <div className="w-full h-full flex items-center justify-center">
                        {" "}
                        <RiLoader5Line
                          className={`text-xl dark:text-white text-black animate-spin`}
                        />{" "}
                      </div>
                    ) : (
                      <>
                        {holders.length > 0 &&
                          holders.map((item: any, i) => (
                            <div className="flex text-center h-16 items-center border-b-[1px] border-gray-300">
                              <div className="flex-shrink-0 w-[35%] font-medium text-sm max-md:text-xs ">
                                <h2
                                  className={`flex gap-2 items-center justify-center relative font-semibold ${
                                    i + 1 == 1 &&
                                    "bg-gradient-to-b from-yellow-700 via-yellow-400 to-yellow-600 text-transparent bg-clip-text"
                                  } ${
                                    i + 1 == 2 &&
                                    "bg-gradient-to-b from-gray-700 via-gray-400 to-gray-600 text-transparent bg-clip-text"
                                  } ${
                                    i + 1 == 3 &&
                                    "bg-gradient-to-b from-orange-800 via-orange-500 to-orange-700 text-transparent bg-clip-text"
                                  }`}
                                >
                                  {i < 3 && (
                                    <FaCrown
                                      className={`${
                                        i + 1 == 1 && "text-yellow-500"
                                      } absolute -translate-x-5 ${
                                        i + 1 == 2 && "text-gray-400"
                                      } ${i + 1 == 3 && "text-orange-700"}`}
                                    />
                                  )}
                                  {i + 1}
                                </h2>
                              </div>
                              <div className="w-[15%] flex justify-center">
                                {item?.image != "" ? (
                                  <Image
                                    width={1080}
                                    height={1080}
                                    src={item?.image}
                                    alt="dp"
                                    className="w-8 h-8 rounded-full "
                                  />
                                ) : (
                                  <div className="w-8 h-8 border-[1px] border-dashed rounded-full bg-nifty-gray-1/20"></div>
                                )}
                              </div>
                              <div
                                className={`flex-shrink-0 w-[15%] font-medium flex gap-2 items-center justify-center text-sm max-md:text-xs dark:text-white text-nifty-gray-2 `}
                              >
                                <h2 className="text-center ">
                                  {item?.username?.slice(0, 20)}
                                  {item?.username?.length > 20 && "..."}
                                </h2>
                              </div>
                              <div
                                className={`flex-shrink-0 w-[35%] font-medium text-sm max-md:text-xs dark:text-white text-nifty-gray-2 `}
                              >
                                <h2>{item?.holding}</h2>
                              </div>
                            </div>
                          ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <RecommendedFetcher />
      </div>
    </>
  );
};
