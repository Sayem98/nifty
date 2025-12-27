"use client";
import { GoDotFill } from "react-icons/go";
import { ethers } from "ethers";
import abi from "@/utils/abis/templateABI";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import Image from "next/image";
import { IoIosRocket, IoMdTrash } from "react-icons/io";
import masterABI from "@/utils/abis/masterABI";
import { useGlobalContext } from "@/context/MainContext";
import { useRouter } from "next/navigation";
import {
  FaChartLine,
  FaDiscord,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaFileAudio,
  FaGlobeAmericas,
  FaInstagram,
  FaPause,
  FaPen,
} from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import { CiImageOn, CiShare2 } from "react-icons/ci";
import Book from "@/components/Global/Book";
import { Analytics } from "@/components/Author/Analytics";
import Link from "next/link";
import { useLoading } from "@/components/PageLoader/LoadingContext";
import { useSession } from "next-auth/react";
import { RiLoader5Fill, RiLoader5Line } from "react-icons/ri";

import placeholder from "@/assets/og.png";
import { AiOutlineLoading } from "react-icons/ai";
import { FaXTwitter } from "react-icons/fa6";
import { SiFarcaster } from "react-icons/si";
import { ImCross } from "react-icons/im";

export default function Home() {
  const router = useRouter();

  const { user, getUser, night } = useGlobalContext();

  const [publishedBooks, setPublishedBooks] = useState([]);
  const [draftBooks, setDraftBooks] = useState([]);
  const [hiddenBooks, setHiddenBooks] = useState([]);

  const [slicer, setSlicer] = useState<number>(4);

  const [addtime, setAddtime] = useState("");

  const [loading, setLoading] = useState(false);
  const [priceModal, setPriceModal] = useState(false);
  const [id, setId] = useState("");
  const [pausedBooks, setPausedBooks] = useState<Array<BookType>>([]);
  const [boostModal, setBoostModal] = useState(false);
  const [price, setPrice] = useState("");

  const [mintPrice, setMintPrice] = useState<number>(0);
  const [maxMints, setMaxMints] = useState<number>(0);
  const [maxMintsPerWallet, setMaxMintsPerWallet] = useState<number>(0);

  const [ogmintprice, setogMintPrice] = useState<number>(0);
  const [ogmaxMints, setogMaxMints] = useState<number>(0);
  const [ogmaxMintsPerWallet, setogMaxMintsPerWallet] = useState<number>(0);

  const [name, setName] = useState<string>("");

  async function contractSetup() {
    try {
      //@ts-ignore
      if (typeof window?.ethereum !== "undefined") {
        //@ts-ignore
        await window?.ethereum.request({ method: "eth_requestAccounts" });

        //@ts-ignore
        const provider = new ethers.providers.Web3Provider(window?.ethereum);
        const signer = provider.getSigner();

        const network = await provider.getNetwork();

        const isBase = network.chainId === 8453;

        if (!isBase) {
          toast.error("Not connected to Base network");
          setLoading(false);
          return null;
        }
        //@ts-ignore
        const contract = new ethers.Contract(user?.contractAdd, abi, signer);

        return contract;
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function getContractDetails() {
    try {
      const contract = await contractSetup();
      // console.log(contract?.address);
      const contractName = await contract?.name();

      // console.log(contractName);

      setName(contractName);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    // console.log(user)

    if (user) {
      // console.log("checking");
      if (user?.contractAdd == "") {
        router.push("/makeCollection");
      }

      getContractDetails();
      getReports();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      var arr1: any = [];
      var subArr1: any = [];
      var arr2: any = [];
      var subArr2: any = [];

      var arr3: any = [];
      var subArr3: any = [];

      var pausedArr: any = [];

      user?.yourBooks?.reverse().map((item: any, i) => {
        if (item?.isPaused && !item?.isAdminRemoved) {
          pausedArr.push(item);
        }
        if (item?.isPublished && !item?.isHidden && !item?.isAdminRemoved) {
          subArr1.push(item);
        }
        if (subArr1.length == slicer || i == user?.yourBooks?.length - 1) {
          if (subArr1.length > 0) arr1.push(subArr1);
          subArr1 = [];
        }
        if (!item.isPublished) {
          subArr2.push(item);
          // console.log(item);
        }
        if (subArr2.length == slicer || i == user.yourBooks.length - 1) {
          if (subArr2.length > 0) arr2.push(subArr2);
          subArr2 = [];
        }

        if (item.isPublished && item.isHidden && !item.isAdminRemoved) {
          subArr3.push(item);
        }
        if (subArr3.length == slicer || i == user.yourBooks.length - 1) {
          if (subArr3.length > 0) arr3.push(subArr3);
          subArr3 = [];
        }
      });

      //@ts-ignore
      // if(arr1[0].length > 0)
      setPublishedBooks(arr1);
      setPausedBooks(pausedArr);
      setHiddenBooks(arr3);
      //@ts-ignore
      setDraftBooks(arr2);
    }
  }, [slicer, user]);

  useEffect(() => {
    const screenWidth = window?.innerWidth;

    if (screenWidth > 1100) {
      setSlicer(5);
    }
  }, []);

  function handleDraft(item: any) {
    // console.log(item.cover, item.pdf, item.name, item.tags);
    localStorage?.setItem("name", item.name);
    localStorage?.setItem("id", item._id);

    localStorage?.setItem("price", item.price);
    localStorage?.setItem("maxMint", item.maxMint);
    localStorage?.setItem("cover", item.cover);
    localStorage?.setItem("artist", item.artist);
    localStorage?.setItem("isbn", item.ISBN);
    localStorage?.setItem("description", item.description);
    localStorage?.setItem("tags", JSON.stringify(item.tags));
    localStorage?.setItem("pdf", item.pdf);
    localStorage?.setItem("maxMintsPerWallet", item.maxMintsPerWallet);
    localStorage?.setItem("coverDate", item.cover.split("/")[6]);
    localStorage?.setItem("pdfDate", item.pdf.split("/")[6]);

    localStorage?.setItem("tokenId", item.tokenId);

    router.push("/publish");
  }

  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [bannerImg, setBannerImg] = useState<File | null>(null);

  const [imageModal, setImageModal] = useState<boolean>(false);
  const [bannerModal, setBannerModal] = useState<boolean>(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfileImg(e.target.files[0]);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setBannerImg(e.target.files[0]);
    }
  };

  const { address } = useAccount();

  const { data: session } = useSession();

  async function handleSubmit(e: any) {
    setLoading(true);
    e.preventDefault();

    if (!user?.wallet) {
      toast.error("Somwthing went wrong. Please try again");
      return;
    }

    try {
      // Create FormData object
      const formData = new FormData();

      //@ts-ignore
      if (!bannerImg && profileImg && user) {
        formData.append("profileImage", profileImg);
        formData.append("wallet", user?.wallet);
      }

      //@ts-ignore
      if (bannerImg && !profileImg && user) {
        // console.log("brooo")
        formData.append("bannerImage", bannerImg);
        formData.append("wallet", user?.wallet);
      }

      // Upload to S3 using the API route
      const response = await axios.patch("/api/profileCreate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status !== 200) {
        setLoading(false);
        toast.error("An error occurred while uploading.");
        return;
      }

      // Reset form fields
      if (response.status == 200) {
        setLoading(false);
        window?.location.reload();
      }

      // alert("Collection created successfully!");
    } catch (error) {
      setLoading(false);
      toast.error(
        "An error occurred while creating the collection. Please try again."
      );
      console.log(error);
      // console.log(session);
    }
  }

  async function deleteBook(id: string) {
    try {
      // console.log(id);
      await axios.delete("/api/book/" + id).then((res) => {
        // console.log(res.data.data);
        getUser();
      });
    } catch (err) {
      // console.log(err);
    }
  }

  async function unHide(id: string) {
    try {
      // console.log(id);
      await axios.patch("/api/book/" + id, { isHidden: false }).then((res) => {
        // console.log(res.data.data);
        getUser();
      });
    } catch (err) {
      // console.log(err);
    }
  }

  async function hide(id: string) {
    try {
      // console.log(id);
      await axios.patch("/api/book/" + id, { isHidden: true }).then((res) => {
        // console.log(res.data.data);
        getUser();
      });
    } catch (err) {
      // console.log(err);
    }
  }

  useEffect(() => {
    getUser();
  }, []);

  async function masterContractSetup() {
    try {
      //@ts-ignore
      if (typeof window?.ethereum !== "undefined") {
        const masterAdd = "0xE98C64778fA9ff408af6f00C4eAF76A1997a3Ae7";

        //@ts-ignore
        await window?.ethereum.request({ method: "eth_requestAccounts" });

        //@ts-ignore
        const provider = new ethers.providers.Web3Provider(window?.ethereum);
        const signer = provider.getSigner();

        const network = await provider.getNetwork();

        const isBase = network.chainId === 8453;

        if (!isBase) {
          toast.error("Not connected to Base network");
          setLoading(false);
          return null;
        }
        //@ts-ignore
        const contract = new ethers.Contract(masterAdd, masterABI, signer);

        return contract;
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleBoost() {
    try {
      setLoading(true);
      if (typeof window?.ethereum !== "undefined") {
        const contract = await masterContractSetup();

        console.log("hello", contract, price);
        const gasEstimate = await contract?.estimateGas
          .boostBook({ value: price })
          .catch((err) => {
            console.log(err);
          });
        console.log("hello2", gasEstimate);
        // Add a 20% buffer to the gas estimate
        const gasLimit = gasEstimate?.mul(130).div(100);

        // Get current gas price
        const gasPrice = await contract?.provider.getGasPrice();
        console.log(price);
        const res = await contract
          ?.boostBook({
            value: price,
            gasLimit: gasLimit,
            gasPrice: gasPrice,
          })
          .catch((err: any) => {
            console.log(err);
          });

        await res.wait();

        if (res) {
          await axios.patch("/api/book/" + id, {
            isBoosted: String(Date.now() + Number(addtime)),
          });
          toast.success("Book boosted");
          setLoading(false);
          setBoostModal(false);
        }
      }
    } catch (err) {
      setLoading(false);
      //   await axios.patch("/api/book/"+id, {isBoosted: null});
      toast.error("An error occured");
      console.error(err);
    }
  }

  const [tokenId, setTokenId] = useState<number>(0);

  const [status, setStatus] = useState<string>("");

  async function handlePriceChange() {
    try {
      setLoading(true);
      const contract = await contractSetup();

      if (ogmintprice != mintPrice) {
        setStatus("Updating Mint Price");
        const txn = await contract?.changePrice(
          tokenId,
          ethers.utils.parseEther(String(mintPrice))
        );
        await txn.wait();
        if (txn) await axios.patch("/api/book/" + id, { price: mintPrice });
      }

      if (ogmaxMints != maxMints) {
        setStatus("Updating Max Mints");
        const txn = await contract?.changeMaxMints(tokenId, maxMints);
        await txn.wait();

        if (txn) await axios.patch("/api/book/" + id, { maxMint: maxMints });
      }

      if (ogmaxMintsPerWallet != maxMintsPerWallet) {
        setStatus("Updating Max Mints Per Wallet");
        const txn = await contract?.changeMaxMintsPerWallet(
          tokenId,
          maxMintsPerWallet
        );
        await txn.wait();

        if (txn)
          await axios.patch("/api/book/" + id, {
            maxMintsPerWallet: maxMintsPerWallet,
          });
      }

      setLoading(false);
      setStatus("");
      setPriceModal(false);
      getUser();
      toast.success("All details updated");
    } catch (err) {
      setStatus("");
      setLoading(false);
      console.log(err);
      toast.success("Error while uploading details");
    }
  }

  const [reportedArr, setReportedArr] = useState([]);

  async function getReports() {
    try {
      const res = await axios.get("/api/author/reported/" + user?.email);
      console.log(res.data.array);
      setReportedArr(res.data.array);
    } catch (err) {
      console.log(err);
    }
  }

  const [loadingPause, setLoadingPause] = useState<boolean>(false);

  async function pauseMint(tokenId: number, id: string) {
    try {
      const contract = await contractSetup();

      const txn = await contract?.pauseMint(tokenId);

      await txn.wait();

      if (txn) {
        await axios.patch("/api/book/" + id, { isPaused: true }).then((res) => {
          toast.success("Mint paused for the book!");
          setLoadingPause(false);
          getUser();
        });
      }
    } catch (err) {
      console.log(err);
      setLoadingPause(false);
      toast.error("Error while pausing mint.");
    }
  }

  async function unpauseMint(tokenId: number, id: string) {
    try {
      const contract = await contractSetup();

      const txn = await contract?.unpauseMint(tokenId);

      await txn.wait();

      if (txn) {
        await axios
          .patch("/api/book/" + id, { isPaused: false })
          .then((res) => {
            toast.success("Mint un-paused for the book!");
            setLoadingPause(false);
            getUser();
          });
      }
    } catch (err) {
      console.log(err);
      toast.error("Error while un-pausing mint.");
      setLoadingPause(false);
    }
  }

  const [bringSocialsModal, setBringSocialsModal] = useState(false);
  const [insta, setInsta] = useState<string>("");
  const [twitter, setTwitter] = useState<string>("");
  const [web, setWeb] = useState<string>("");
  const [farcaster, setFarcaster] = useState<string>("");

  async function handleUpdateSocials() {
    try {
      const localInsta =
        insta !== "" && insta.split("/")[0] == "https:"
          ? insta
          : insta != ""
          ? "https://" + insta
          : "";
      const localTwitter =
        twitter !== "" && twitter.split("/")[0] == "https:"
          ? twitter
          : twitter != ""
          ? "https://" + twitter
          : "";
      const localWebsite =
        web !== "" && web.split("/")[0] == "https:"
          ? web
          : web != ""
          ? "https://" + web
          : "";
      const localFarcaster =
        farcaster !== "" && farcaster.split("/")[0] == "https:"
          ? farcaster
          : farcaster != ""
          ? "https://" + farcaster
          : "";

      setLoading(true);
      await axios
        .patch("/api/user/" + user?.email, {
          instagram: localInsta,
          twitter: localTwitter,
          website: localWebsite,
          farcaster: localFarcaster,
        })
        .then((res) => {
          toast.success("Updated your socials!");
          getUser();
          setBringSocialsModal(false);
          setLoading(false);
        });
    } catch (err) {
      console.log(err);
      toast.error("Error while updating socials");
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      setInsta(user?.instagram);
      setTwitter(user?.twitter);
      setWeb(user?.website);
      setFarcaster(user?.farcaster);
    }
  }, [user]);

  const [audio, setAudio] = useState<File | null>(null);
  const [requiredAudio, setRequiredAudio] = useState<boolean>(false);
  const [audioLink, setAudioLink] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);

  async function handleAudioChange(e: any) {
    try {
      setAudio(e.target.files[0]);
    } catch (err) {
      console.log(err);
    }
  }

  async function saveAudio() {
    if (!audio) {
      setRequiredAudio(true);
      toast.error("Upload an audio file");
    }
    if (!address) {
      toast.error("Connect your wallet");
    }
    try {
      setUploading(true);
      setRequiredAudio(false);

      const formData = new FormData();
      formData.append("audio", audio as Blob);
      formData.append("wallet", address as string);
      console.log(id);
      formData.append("bookId", id);

      const response = await axios.post("/api/uploadAudiobook", formData);
      //@ts-ignore
      if (response == true) {
        toast.success("Audio uploaded!");
      }
    } catch (err) {
      console.log(err);
      toast.error("Error while uploading audio");
    } finally {
      setUploading(false);
      setPriceModal(false);
    }
  }

  return (
    <div
      className={`dark:bg-nifty-black dark:text-white bg-white text-black duration-200`}
    >
      {/* <div className="h-16 w-screen relative z-[1000]">
                <Navbar/>
            </div> */}
      <div
        className={`w-screen h-screen fixed top-0 left-0 z-[-1] dark:bg-nifty-black bg-white`}
      ></div>

      {/* BOOST MODAL */}
      <div
        className={`w-screen h-screen fixed top-0 left-0 ${
          boostModal ? "translate-y-0" : "-translate-y-[100rem]"
        } backdrop-blur-xl duration-200 flex z-[100] items-center justify-center`}
      >
        <div
          className={` dark:bg-nifty-black bg-white shadow-xl shadow-black/30 w-80 rounded-xl p-4 `}
        >
          <h2 className="text-2xl font-bold mb-5">Duration</h2>
          <div className="flex gap-2 flex-wrap items-center justify-center">
            <button
              onClick={() => {
                setPrice("1000000000000000");
                setAddtime("86400000");
              }}
              className={`flex flex-col ${
                price == "1000000000000000" &&
                " brightness-125 border-black border-2 "
              } items-center justify-center w-32 bg-nifty-gray-1/30 hover:scale-105 p-2 rounded-lg duration-200 text-nifty-gray-1-2/80`}
            >
              <h2 className="font-bold text-md">1 Day</h2>
              <h2 className="font-bold text-sm">0.001 ETH</h2>
            </button>
            <button
              onClick={() => {
                setPrice("2500000000000000");
                setAddtime("259200000");
              }}
              className={`flex flex-col ${
                price == "2500000000000000" &&
                " brightness-125 border-black border-2 "
              } items-center justify-center w-32 bg-nifty-gray-1/30 hover:brightness-110 p-2 rounded-lg duration-200 hover:scale-105 text-nifty-gray-1-2/80`}
            >
              <h2 className="font-bold text-md">3 Days</h2>
              <h2 className="font-bold text-sm">0.0025 ETH</h2>
            </button>
            <button
              onClick={() => {
                setPrice("5000000000000000");
                setAddtime("604800000");
              }}
              className={`flex flex-col ${
                price == "5000000000000000" &&
                " brightness-125 border-black border-2 "
              } items-center justify-center w-32 bg-nifty-gray-1/30 hover:brightness-110 p-2 rounded-lg duration-200 hover:scale-105 text-nifty-gray-1-2/80`}
            >
              <h2 className="font-bold text-md">1 Week</h2>
              <h2 className="font-bold text-sm">0.005 ETH</h2>
            </button>
            <button
              onClick={() => {
                setPrice("15000000000000000");
                setAddtime("2419200000");
              }}
              className={`flex flex-col ${
                price == "15000000000000000" &&
                " brightness-125 border-black border-2 "
              } items-center justify-center w-32 bg-nifty-gray-1/30 hover:brightness-110 p-2 rounded-lg duration-200 hover:scale-105 text-nifty-gray-1-2/80`}
            >
              <h2 className="font-bold text-md">1 Month</h2>
              <h2 className="font-bold text-sm">0.015 ETH</h2>
            </button>
          </div>

          <div className="w-full flex gap-2 items-center justify-center mt-5">
            <button
              onClick={handleBoost}
              className="bg-black text-white font-semibold  h-10 w-1/2 rounded-lg hover:-translate-y-1 duration-200"
            >
              {loading ? (
                <div className="w-full flex items-center justify-center">
                  <RiLoader5Line className="animate-spin text-xl" />
                </div>
              ) : (
                "Confirm"
              )}
            </button>
            <button
              onClick={() => {
                setBoostModal(false);
              }}
              className="bg-gray-200 font-semibold  text-black h-10 w-1/2 rounded-lg hover:-translate-y-1 duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <div
        className={`h-screen w-screen backdrop-blur-xl z-[100] flex items-center justify-center fixed top-0 ${
          imageModal ? "translate-y-0" : "-translate-y-[120rem]"
        } duration-300 ease-in-out left-0`}
      >
        <div className="bg-white gap-4 max-md:w-[90%] h-84 w-80 rounded-xl p-6 flex flex-col items-center justify-center">
          <div className="w-full items-end flex justify-end text-xl">
            <button
              onClick={() => {
                setImageModal(false);
              }}
              className="text-black hover:text-red-500 duration-200"
            >
              <IoClose />
            </button>
          </div>
          <div>
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-48 h-48 border-2 border-jel-gray-3 border-dashed rounded-full cursor-pointer hover:bg-jel-gray-1"
            >
              <div className="flex flex-col items-center h-full w-full p-2 overflow-hidden justify-center rounded-lg">
                {!profileImg ? (
                  <svg
                    className="w-8 h-8 text-jel-gray-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                ) : (
                  <Image
                    alt="hello"
                    className="w-full h-full object-cover rounded-full hover:scale-110 hover:opacity-30 duration-300"
                    width={1000}
                    height={1000}
                    src={
                      !profileImg
                        ? ""
                        : profileImg instanceof File
                        ? URL.createObjectURL(profileImg)
                        : profileImg
                    }
                  />
                )}
              </div>
              <input
                id="dropzone-file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          <button
            onClick={handleSubmit}
            className="py-2 bg-black md:w-40 max-md:text-sm w-32 flex items-center justify-center text-white font-bold gap-2 rounded-lg hover:-translate-y-1 duration-200"
          >
            {loading ? (
              <AiOutlineLoading className=" animate-spin text-white" />
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>

      {/* Mint update progress */}
      <div
        className={` ${
          status !== "" ? "translate-y-0" : "-translate-y-[100rem]"
        } duration-200 backdrop-blur-xl flex flex-col items-center z-[510] justify-center fixed top-0 left-0 w-screen h-screen`}
      >
        <div className="w-80 p-4 shadow-xl shadow-black/30 rounded-xl bg-white flex flex-col items-center">
          <h2 className="text-nifty-gray-1 text-sm">
            Confirm all the transactions to change data on contract level
          </h2>
          <h2 className="flex items-center justify-center gap-2 my-4">
            <RiLoader5Fill className="animate-spin text-xl" />
            {status}
          </h2>
        </div>
      </div>

      {/*Socials Modal*/}
      <div
        className={` ${
          bringSocialsModal ? "translate-y-0" : "-translate-y-[100rem]"
        } duration-200 backdrop-blur-xl flex flex-col items-center z-[110] justify-center fixed top-0 left-0 w-screen h-screen`}
      >
        <div
          className={`dark:bg-[#313131] bg-white rounded-xl shadow-xl w-80 p-4 shadow-black/30 flex-col flex gap-2`}
        >
          <h3 className="text-xl font-bold">Update Socials</h3>
          <div className="w-full text-start flex flex-col my-2">
            <input
              placeholder={`https://...`}
              onChange={(e) => {
                setInsta(e.target.value);
              }}
              value={insta}
              className={`p-2  placeholder:text-gray-300/40 bg-gray-300/20 w-full peer focus:outline-none dark:focus:border-white focus:border-black focus:border-2 rounded-xl border-[1px] duration-200 `}
            ></input>
            <h2
              className={`text-sm max-md:text-xs text-semibold text-nifty-gray-1 order-first dark:peer-focus:text-white peer-focus:text-black peer-focus:font-semibold duration-200`}
            >
              Instagram
            </h2>
          </div>
          <div className="w-full text-start flex flex-col my-2">
            <input
              placeholder={`https://...`}
              onChange={(e) => {
                setTwitter(e.target.value);
              }}
              value={twitter}
              className={`p-2  placeholder:text-gray-300/40 bg-gray-300/20 w-full peer focus:outline-none dark:focus:border-white focus:border-black focus:border-2 rounded-xl border-[1px] duration-200 `}
            ></input>
            <h2
              className={`text-sm max-md:text-xs text-semibold text-nifty-gray-1 order-first dark:peer-focus:text-white peer-focus:text-black peer-focus:font-semibold duration-200`}
            >
              X (Twitter)
            </h2>
          </div>
          <div className="w-full text-start flex flex-col my-2">
            <input
              placeholder={`https://...`}
              onChange={(e) => {
                setWeb(e.target.value);
              }}
              value={web}
              className={`p-2  placeholder:text-gray-300/40 bg-gray-300/20 w-full peer focus:outline-none dark:focus:border-white focus:border-black focus:border-2 rounded-xl border-[1px] duration-200 `}
            ></input>
            <h2
              className={`text-sm max-md:text-xs text-semibold text-nifty-gray-1 order-first dark:peer-focus:text-white peer-focus:text-black peer-focus:font-semibold duration-200`}
            >
              Website
            </h2>
          </div>
          <div className="w-full text-start flex flex-col my-2">
            <input
              placeholder={`https://...`}
              onChange={(e) => {
                setFarcaster(e.target.value);
              }}
              value={farcaster}
              className={`p-2  placeholder:text-gray-300/40 bg-gray-300/20 w-full peer focus:outline-none dark:focus:border-white focus:border-black focus:border-2 rounded-xl border-[1px] duration-200 `}
            ></input>
            <h2
              className={`text-sm max-md:text-xs text-semibold text-nifty-gray-1 order-first dark:peer-focus:text-white peer-focus:text-black peer-focus:font-semibold duration-200`}
            >
              Farcaster
            </h2>
          </div>
          <div className="flex gap-2 w-full">
            <button
              disabled={loading}
              onClick={handleUpdateSocials}
              className="py-2 bg-black md:w-40 max-md:text-sm w-1/2 flex items-center justify-center text-white font-bold gap-2 rounded-lg hover:-translate-y-1 duration-200"
            >
              {loading ? (
                <AiOutlineLoading className=" animate-spin text-white" />
              ) : (
                "Save"
              )}
            </button>
            <button
              onClick={() => {
                setBringSocialsModal(false);
              }}
              className="bg-gray-200 font-semibold  text-black h-10 w-1/2 rounded-lg hover:-translate-y-1 duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Update Price Modal */}
      <div
        className={` ${
          priceModal ? "translate-y-10" : "-translate-y-[100rem]"
        } duration-200 backdrop-blur-xl flex flex-col items-center z-[110] justify-center fixed top-0 left-0 w-screen h-screen`}
      >
        <div
          className={`dark:bg-[#313131] bg-white relative pt-10 rounded-xl shadow-xl max-md:w-80 w-[50%] p-4 shadow-black/30 flex max-md:flex-col gap-5`}
        >
          <div className="w-full absolute top-0 left-0 flex justify-end p-4">
            <button
              onClick={() => {
                setPriceModal(false);
              }}
              className=" font-semibold rounded-lg duration-200"
            >
              <ImCross
                className={`text-nifty-gray-1 hover:text-red-500 duration-200`}
              />
            </button>
          </div>
          <div className="md:w-1/2 h-72">
            <h3 className="text-xl font-bold">Update Mint Details</h3>
            <div className="w-full text-start flex flex-col my-2">
              <input
                placeholder={`Leave ${0} if free mint`}
                min={0}
                type="number"
                onChange={(e) => {
                  setMintPrice(Number(Number(e.target.value)?.toFixed(4)));
                }}
                value={mintPrice}
                className={`p-2  placeholder:text-gray-300/40 bg-gray-300/20 w-full peer focus:outline-none dark:focus:border-white focus:border-black focus:border-2 rounded-xl border-[1px] duration-200 `}
              ></input>
              <h2 className="text-sm text-semibold text-nifty-gray-1 order-first peer-focus:text-black peer-focus:font-semibold duration-200">
                Mint Price in ETH
              </h2>
            </div>
            <div className="w-full text-start flex flex-col my-2">
              <input
                placeholder={`Leave ${0} if free mint`}
                min={0}
                type="number"
                onChange={(e) => {
                  setMaxMints(Math.round(Number(e.target.value)));
                }}
                value={maxMints}
                className={`p-2  placeholder:text-gray-300/40 bg-gray-300/20 w-full peer focus:outline-none dark:focus:border-white focus:border-black focus:border-2 rounded-xl border-[1px] duration-200 `}
              ></input>
              <h2 className="text-sm text-semibold text-nifty-gray-1 order-first peer-focus:text-black peer-focus:font-semibold duration-200">
                Max Mints
              </h2>
            </div>
            <div className="w-full text-start flex flex-col my-2">
              <input
                placeholder={`Leave ${0} if free mint`}
                min={0}
                type="number"
                onChange={(e) => {
                  setMaxMintsPerWallet(Math.round(Number(e.target.value)));
                }}
                value={maxMintsPerWallet}
                className={`p-2  placeholder:text-gray-300/40 bg-gray-300/20 w-full peer focus:outline-none dark:focus:border-white focus:border-black focus:border-2 rounded-xl border-[1px] duration-200 `}
              ></input>
              <h2 className="text-sm text-semibold text-nifty-gray-1 order-first peer-focus:text-black peer-focus:font-semibold duration-200">
                Max Mints per Wallet
              </h2>
            </div>
            <div className="flex gap-2 w-full">
              <button
                disabled={loading}
                onClick={handlePriceChange}
                className="py-2 bg-black w-full max-md:text-sm flex items-center justify-center text-white font-bold gap-2 rounded-lg hover:-translate-y-1 duration-200"
              >
                {loading ? (
                  <AiOutlineLoading className=" animate-spin text-white" />
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
          <div className="md:h-72 md:w-[0.1rem] h-[0.1rem] w-72 bg-white/20"></div>
          <div className="md:w-1/2 h-72 w-full flex items-start flex-col justify-center">
            <h3 className="text-xl font-bold">Add Audiobook</h3>

            <div className="w-full">
              <div className="w-full">
                <label
                  htmlFor="dropzone-file2"
                  className={`flex flex-col items-center justify-center w-full h-48 border-2 ${
                    requiredAudio ? "border-red-500" : "border-jel-gray-3"
                  } border-dashed group rounded-xl mt-2 cursor-pointer hover:bg-jel-gray-1`}
                >
                  <div className="flex flex-col items-center h-full w-full p-2 overflow-hidden justify-center rounded-lg">
                    {!audio ? (
                      <div
                        className={`bg-gray-300/30 dark:text-white text-blackduration-200 gap-2 flex flex-col items-center justify-center w-full h-full rounded-xl`}
                      >
                        <FaFileAudio className="text-xl" />
                        <h3 className="w-[80%] text-xs text-center">
                          Choose a .mp3 file for best experience.
                        </h3>
                      </div>
                    ) : (
                      <div className="text-sm max-md:text-xs font-bold group-hover:scale-105 duration-200">
                        {audio.name}
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="audio/*"
                    id="dropzone-file2"
                    onChange={(e) => {
                      console.log(e);
                      handleAudioChange(e);
                      setRequiredAudio(false);
                    }}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={saveAudio}
                  disabled={uploading}
                  className=" w-full py-2 font-bold bg-black text-white h-10 rounded-lg hover:-translate-y-1 duration-200 text-nowrap mt-4"
                >
                  {uploading ? (
                    <RiLoader5Fill className="animate-spin text-xl mx-auto" />
                  ) : (
                    "Upload"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Modal */}
      <div
        className={`h-screen w-screen backdrop-blur-xl z-[100] flex items-center justify-center fixed top-0 ${
          bannerModal ? "translate-y-0" : "-translate-y-[120rem]"
        } duration-300 ease-in-out left-0`}
      >
        <div className="bg-white gap-4 max-md:w-[90%] h-84 w-96 rounded-xl p-6 flex flex-col items-center justify-center">
          <div className="w-full items-end flex justify-end text-xl">
            <button
              onClick={() => {
                setBannerModal(false);
              }}
              className="text-black hover:text-red-500 duration-200"
            >
              <IoClose />
            </button>
          </div>
          <div className="w-full h-full">
            <label
              htmlFor="banner-dropzone-file"
              className="flex rounded-xl flex-col items-center justify-center w-full h-full border-2 border-jel-gray-3 border-dashed  cursor-pointer hover:bg-jel-gray-1"
            >
              <div className="flex flex-col items-center h-32 w-full p-2 overflow-hidden justify-center rounded-lg">
                {!bannerImg ? (
                  <div className="w-full h-full bg-gray-200 rounded-xl flex flex-col items-center justify-center">
                    <CiImageOn className="text-xl text-nifty-gray-1" />
                    <h3 className="text-xs text-nifty-gray-1 text-center font-semibold">
                      Upload a 1500x500 png image for best quality
                    </h3>
                  </div>
                ) : (
                  <Image
                    alt="hello"
                    className="w-full h-full object-cover rounded-lg hover:scale-110 hover:opacity-30 duration-300"
                    width={1000}
                    height={1000}
                    src={
                      !bannerImg
                        ? ""
                        : bannerImg instanceof File
                        ? URL.createObjectURL(bannerImg)
                        : bannerImg
                    }
                  />
                )}
              </div>
              <input
                id="banner-dropzone-file"
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="hidden"
              />
            </label>
            {/* <button onClick={handleSubmit} disabled={uploading} className=' col-span-2 w-32 py-2 font-medium text-black rounded-xl hover:-translate-y-[0.3rem] duration-200 bg-jel-gray-3 hover:bg-jel-gray-2 text-nowrap mt-2'>{uploading ? "Uploading..." : "Upload"}</button> */}
          </div>
          <button
            onClick={handleSubmit}
            className="py-2 bg-black md:w-40 max-md:text-sm w-32 flex items-center justify-center text-white font-bold gap-2 rounded-lg hover:-translate-y-1 duration-200"
          >
            {loading ? (
              <AiOutlineLoading className=" animate-spin text-white" />
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>

      <div className="w-screen relative h-[15rem] md:h-[22rem] max-md:flex items-center justify-center overflow-hidden object-fill ">
        <div className="w-screen flex item-center justify-center group absolute h-full overflow-hidden">
          <button
            onClick={() => {
              setBannerModal(true);
            }}
            className="py-2 bg-black/30 h-12 w-12 relative z-[70] mt-4 max-md:text-sm flex items-center justify-center text-white font-bold gap-2 rounded-full hover:-translate-y-1 duration-200"
          >
            <FaEdit />
          </button>

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
              `${process.env.NEXTAUTH_URL}/authors/` + address
            );
            toast.success("Successfully copied link!");
          }}
          className="absolute bottom-0 right-0 bg-white/10 px-4 py-2 z-[100] text-white font-semibold md:right-0 rounded-tl-xl border-t-[1px] hover:bg-white/20 duration-200 border-l-[1px] border-white"
        >
          <CiShare2 />
        </button>
        <div className="flex gap-8 object-center items-center h-full md:px-10 w-screen justify-center md:justify-start my-auto relative z-50 backdrop-blur-xl">
          <button
            onClick={() => {
              setImageModal(true);
            }}
            className="rounded-full group relative duration-200 flex items-center justify-center"
          >
            <FaPen className="group-hover:opacity-100 opacity-0 duration-200 absolute z-50 text-xl text-white brightness-200" />
            <Image
              width={1080}
              height={1080}
              src={user?.collectionImage + "?v=" + Date.now() || ""}
              alt="dp"
              className="md:w-[10rem] object-cover object-center group-hover:brightness-50 duration-200 md:h-[10rem] h-[6rem] w-[6rem] border-4 border-white rounded-xl"
            />
          </button>
          <div className="flex flex-col gap-2 relative z-50">
            <h2 className="md:text-5xl text-xl font-bold text-white">
              {user?.collectionName}
            </h2>
            <a
              href={`https://basescan.org/address/${user?.contractAdd}`}
              target="_blank"
              className="md:text-md text-sm underline font-semibold text-white"
            >
              {user?.contractAdd?.substring(0, 7)}...
              {user?.contractAdd?.substring(
                user.contractAdd.length - 7,
                user.contractAdd.length
              )}
            </a>

            <div className="my-2 flex gap-2 text-white">
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

              <button
                onClick={() => {
                  setBringSocialsModal(true);
                }}
                className="w-8 h-8 rounded-md bg-white/10 hover:scale-[1.05] text-xl duration-200 border-[1px] border-white"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="absolute right-3 top-3 md:right-3 gap-4 flex items-end justify-end z-50">
          <Link
            href="#analytics"
            className="py-2 bg-white/10 md:w-40 max-md:text-sm w-12 h-10 border-[1px] border-white flex items-center justify-center text-white font-bold gap-2 rounded-lg hover:-translate-y-1 duration-200"
          >
            <span className="max-md:hidden">Analytics</span> <FaChartLine />
          </Link>
        </div>
      </div>

      {user && user?.yourBooks?.length == 0 && user?.contractAdd !== "" ? (
        <div className="w-screen h-[25rem] flex items-center justify-center flex-col">
          <h2 className="text-xl font-bold">Publish your first book!</h2>
          <button
            onClick={() => {
              router.push("/publish");
            }}
            className="bg-[#000000] rounded-lg hover:-translate-y-1 duration-200 text-[#eeeeee] h-10 font-semibold flex items-center justify-center gap-2 px-5 w-52 my-2 max-md:mx-auto"
          >
            Publish
          </button>
        </div>
      ) : (
        <>
          {/* PUBLISHED BOOKS */}
          {user && user?.contractAdd !== "" && (
            <div className="flex flex-col items-start mt-8 justify-center md:px-10 px-4">
              <div className="flex items-center justify-center w-full mb-5">
                <div className="w-1/2 flex items-start justify-start ">
                  <h3 className="text-2xl font-bold">Your Books</h3>
                </div>
                <div className="w-1/2 flex justify-end">
                  <button
                    onClick={() => {
                      router.push("/publish");
                    }}
                    className="bg-[#000000] rounded-lg hover:-translate-y-1 duration-200 text-[#eeeeee] h-10 font-semibold flex items-center max-md:-mr-2 justify-center gap-2 px-5 w-24 my-2 max-md:mx-auto"
                  >
                    + New
                  </button>
                </div>
              </div>

              {publishedBooks?.map((item: any) => (
                <div className="w-full mb-5">
                  <div className="w-full max-md:flex max-md:flex-wrap max-md:gap-6 items-center max-sm:justify-center sm:justify-start md:gap-2 md:grid md:grid-flow-col min-[1100px]:grid-cols-5 md:grid-cols-4 ">
                    {item.map((item2: BookType) => (
                      <div
                        className={`flex group relative flex-col ${
                          item2.isPaused && "grayscale"
                        } items-center px-2 md:px-10 mt-2 justify-center gap-4`}
                      >
                        <div
                          onClick={() => {
                            router.push("/books/" + item2._id);
                          }}
                          className="flex cursor-pointer gap-2 absolute bottom-0 pb-2 group-hover:opacity-100 opacity-0 h-20 duration-200 bg-gradient-to-b from-transparent z-50 max-md:w-[110%] max-md:translate-y-3 w-[80%]  text-white rounded-b-xl to-black/50 items-center justify-center"
                        >
                          <h2 className="font-semibold text-sm mt-5">
                            {item2.name.slice(0, 15)}
                          </h2>
                        </div>
                        <div className="absolute z-50 top-1 flex gap-2 ">
                          <button
                            onClick={() => {
                              hide(item2._id);
                            }}
                            className="bg-black text-white p-2 text-xl rounded-lg opacity-0 group-hover:opacity-100 duration-200"
                          >
                            <FaEyeSlash />
                          </button>
                          <button
                            onClick={() => {
                              setTokenId(item2.tokenId);
                              setId(item2._id);
                              setMintPrice(item2.price as number);
                              setogMintPrice(item2.price as number);
                              setogMaxMints(item2.maxMint as number);
                              setogMaxMintsPerWallet(
                                item2.maxMintsPerWallet as number
                              );
                              setMaxMints(item2.maxMint as number);
                              setMaxMintsPerWallet(
                                item2.maxMintsPerWallet as number
                              );
                              setPriceModal(true);
                            }}
                            className="bg-black text-white p-3 text-sm rounded-lg opacity-0 group-hover:opacity-100 duration-200"
                          >
                            <FaPen className="text-md" />
                          </button>
                          <button
                            onClick={() => {
                              setId(item2._id);
                              setBoostModal(true);
                            }}
                            className={`bg-gray-200 text-nifty-gray-1-2 p-2 text-xl rounded-lg opacity-0 text-black group-hover:opacity-100 duration-200`}
                          >
                            <IoIosRocket />
                          </button>
                          {!item2.isPaused && (
                            <button
                              disabled={loadingPause}
                              onClick={() => {
                                setLoadingPause(true);
                                pauseMint(item2.tokenId, item2._id);
                              }}
                              className="bg-gray-200 text-nifty-gray-1-2 text-black p-2 text-xl rounded-lg opacity-0 group-hover:opacity-100 duration-200"
                            >
                              {loadingPause ? (
                                <RiLoader5Fill className="animate-spin text-lg" />
                              ) : (
                                <FaPause />
                              )}
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            router.push("/books/" + item2._id);
                          }}
                          className="md:w-40 md:h-68 w-32 max-md:h-44 flex flex-col cursor-pointer relative items-center hover:-translate-y-2 duration-200 justify-center "
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
          )}

          {/* HIDDEN BOOKS */}
          {hiddenBooks?.length > 0 && (
            <div className="flex flex-col items-start mt-8 justify-center md:px-10 px-4">
              <div className="w-full mb-5">
                <h3 className="text-2xl font-bold ">Hidden</h3>
              </div>
              {hiddenBooks.map((item: any) => (
                <div className="w-full mb-5">
                  <div className="w-full max-md:flex max-md:flex-wrap max-md:gap-6 items-center max-sm:justify-center sm:justify-start md:gap-2 md:grid md:grid-flow-col min-[1100px]:grid-cols-5 md:grid-cols-4 ">
                    {item.map((item2: any) => (
                      <div className="flex group relative flex-col items-center px-2 md:px-10 mt-2 justify-center gap-4">
                        <div
                          onClick={() => {
                            router.push("/books/" + item2._id);
                          }}
                          className="flex cursor-pointer gap-2 absolute bottom-0 pb-2 group-hover:opacity-100 opacity-0 h-20 duration-200 bg-gradient-to-b from-transparent z-50 max-md:w-[110%] max-md:translate-y-3 w-[80%]  text-white rounded-b-xl to-black/50 items-center justify-center"
                        >
                          <h2 className="font-semibold text-sm mt-5">
                            {item2.name.slice(0, 15)}
                          </h2>
                        </div>
                        <div className="absolute z-50 top-1  ">
                          <button
                            onClick={() => {
                              unHide(item2._id);
                            }}
                            className="bg-black text-white p-2 text-xl rounded-lg opacity-0 group-hover:opacity-100 duration-200"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => {
                              setLoadingPause(true);
                              pauseMint(item2.tokenId, item2._id);
                            }}
                            className="bg-gray-200 text-nifty-gray-1-2 p-2 text-xl rounded-lg opacity-0 group-hover:opacity-100 duration-200"
                          >
                            {loadingPause ? (
                              <RiLoader5Fill className="animate-spin text-lg" />
                            ) : (
                              <FaPause />
                            )}
                          </button>
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
          )}

          {/* DRAFT BOOKS */}
          {draftBooks?.length > 0 && (
            <div className="flex flex-col items-start mt-8 justify-center md:px-10 px-4">
              <div className="w-full mb-4">
                <h3 className="text-2xl font-bold ">Drafts</h3>
              </div>

              {draftBooks.map((item: any) => (
                <div className="w-full mb-5">
                  <div className="w-full max-md:flex max-md:flex-col max-md:gap-6 md:gap-2 md:grid md:grid-flow-col min-[1100px]:grid-cols-5 md:grid-cols-4 ">
                    {item.map((item2: any) => (
                      <div className="flex group relative flex-col items-center px-2 md:px-10 mt-2 justify-center gap-4">
                        <div
                          onClick={() => {
                            handleDraft(item2);
                          }}
                          className="flex cursor-pointer gap-2 absolute bottom-0 pb-2 group-hover:opacity-100 opacity-0 h-20 duration-200 bg-gradient-to-b from-transparent z-50 max-md:w-[110%] max-md:translate-y-3 w-[80%]  text-white rounded-b-xl to-black/50 items-center justify-center"
                        >
                          <h2 className="font-semibold text-sm mt-5">
                            {item2.name.slice(0, 15)}
                          </h2>
                        </div>
                        <div className="absolute z-50 top-1  ">
                          <button
                            onClick={() => {
                              deleteBook(item2._id);
                            }}
                            className="bg-black text-white p-2 text-xl rounded-lg opacity-0 group-hover:opacity-100 duration-200"
                          >
                            <IoMdTrash />
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            handleDraft(item2);
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
          )}
        </>
      )}

      {pausedBooks?.length > 0 && (
        <div className="flex flex-col items-start mt-8 justify-center md:px-10 px-4">
          <h2 className="text-2xl font-bold flex gap-2 items-center justify-center">
            <GoDotFill className="animate-pulse text-orange-500" />
            Paused Books
          </h2>
          <div className="w-full max-w-full overflow-x-auto mx-auto my-10">
            <div className="overflow-x-auto ">
              <div className="min-w-[800px] w-[100%]">
                {" "}
                {/* Set a minimum width for the table */}
                <div className="">
                  <div className="flex text-center py-2 border-[1px] rounded-t-lg border-gray-300 text-black">
                    <div className="flex-shrink-0 min-w-32 w-[33.3%] font-medium text-md text-nifty-gray-1">
                      <h2>ID</h2>
                    </div>
                    <div className="flex-shrink-0 min-w-32 w-[33.3%] font-medium text-md text-nifty-gray-1">
                      <h2>Book</h2>
                    </div>

                    <div className="flex-shrink-0 min-w-32 w-[33.3%] font-medium text-md text-nifty-gray-1">
                      <h2>Action</h2>
                    </div>
                    {/* <div className='flex-shrink-0 min-w-32 w-[25%] font-medium text-md text-nifty-gray-1'>
                                        <h2>Contact</h2>
                                    </div> */}
                  </div>

                  <div className="flex flex-col w-full justify-center items-center">
                    {pausedBooks.map((item, i) => (
                      <div
                        className={`flex w-full text-center h-12 border-b-[1px] border-x-[1px] border-gray-300 ${
                          i + 1 == pausedBooks.length && "rounded-b-xl"
                        } items-center justify-center`}
                      >
                        <div className="flex-shrink-0 min-w-32 w-[33.3%] font-medium text-md">
                          <h2>{i + 1}</h2>
                        </div>
                        <div className="flex-shrink-0 min-w-32 w-[33.3%] font-medium text-md">
                          {/* @ts-ignore */}
                          <h2>
                            {item.name.slice(0, 15)}
                            {item.name.length > 15 && "..."}
                          </h2>
                        </div>
                        <div className="flex-shrink-0 min-w-32 w-[33.3%] font-medium text-md">
                          {/* @ts-ignore */}
                          <button
                            onClick={() => {
                              setLoadingPause(true);
                              unpauseMint(item.tokenId, item._id);
                            }}
                            className="text-sm font-bold text-black bg-gray-300 py-1 w-24 rounded-md"
                          >
                            {loadingPause ? (
                              <RiLoader5Fill className="animate-spin mx-auto text-xl" />
                            ) : (
                              "Unpause"
                            )}
                          </button>
                        </div>
                        {/* <div className='flex-shrink-0 flex items-center justify-center min-w-32 w-[25%] font-medium text-md text-black'>
                                                <a href="https://www.3xbuilds.com" target="_blank" ><FaDiscord></FaDiscord></a>
                                            </div> */}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportedArr?.length > 0 && (
        <div className="flex flex-col items-start mt-8 justify-center md:px-10 px-4">
          <h2 className="text-2xl font-bold flex gap-2 items-center justify-center">
            <GoDotFill className="animate-pulse text-red-500" />
            Reports
          </h2>
          <h2 className="mt-4 text-sm text-nifty-gray-1">
            These are your books which have been reported by readers. To resolve
            an issue or report a misunderstanding, please contact us.
          </h2>
          <div className="w-full max-w-full overflow-x-auto mx-auto my-10">
            <div className="overflow-x-auto ">
              <div className="min-w-[800px] w-[100%]">
                {" "}
                {/* Set a minimum width for the table */}
                <div className="">
                  <div className="flex text-center py-2 border-[1px] rounded-t-xl border-gray-300 text-black">
                    <div className="flex-shrink-0 min-w-32 w-[15%] font-medium text-md text-nifty-gray-1">
                      <h2>ID</h2>
                    </div>
                    <div className="flex-shrink-0 min-w-32 w-[15%] font-medium text-md text-nifty-gray-1">
                      <h2>Book</h2>
                    </div>
                    <div className="flex-shrink-0 min-w-32 w-[15%] font-medium text-md text-nifty-gray-1">
                      <h2>Reports</h2>
                    </div>
                    <div className="flex-shrink-0 min-w-32 w-[40%] font-medium text-md text-nifty-gray-1">
                      <h2>Reason</h2>
                    </div>
                    <div className="flex-shrink-0 min-w-32 w-[15%] font-medium text-md text-nifty-gray-1">
                      <h2>Status</h2>
                    </div>
                    {/* <div className='flex-shrink-0 min-w-32 w-[25%] font-medium text-md text-nifty-gray-1'>
                                        <h2>Contact</h2>
                                    </div> */}
                  </div>

                  <div className="flex flex-col w-full justify-center items-center">
                    {reportedArr.map((item: any, i: number) => (
                      <div
                        className={`flex w-full text-center border-gray-300 h-12 border-b-[1px] border-x-[1px] ${
                          i + 1 == reportedArr.length && "rounded-b-xl"
                        } items-center justify-center`}
                      >
                        <div className="flex-shrink-0 min-w-32 w-[15%] font-medium text-md ">
                          <h2>{i + 1}</h2>
                        </div>
                        <div className="flex-shrink-0 min-w-32 w-[15%] font-medium text-md ">
                          {/* @ts-ignore */}
                          <h2>
                            {item.name.slice(0, 10)}
                            {item.name.length > 10 && "..."}
                          </h2>
                        </div>
                        <div className="flex-shrink-0 min-w-32 w-[15%] font-medium text-md ">
                          {/* @ts-ignore */}
                          <h2>{item.reportNum}</h2>
                        </div>
                        <div className="flex-shrink-0 min-w-32 w-[40%] flex items-center justify-center font-medium text-xs ">
                          {/* @ts-ignore */}
                          {item.tagsArr.map((item2) => (
                            <div
                              className={`py-2 w-24 px-2 hover:scale-105 duration-200 hover:brightness-105 rounded-xl flex gap-2 items-center justify-center bg-gray-200 border-2 border-gray-400 font-semibold text-center text-gray-400 text-[0.6rem]`}
                            >
                              {item2}
                            </div>
                          ))}
                        </div>
                        <div className="flex-shrink-0 min-w-32 w-[15%] font-medium text-md text-black">
                          {/* @ts-ignore */}
                          <h2>
                            {item.status ? (
                              <GoDotFill className="text-red-500 mx-auto text-lg" />
                            ) : (
                              <GoDotFill className="text-green-500 mx-auto text-lg" />
                            )}
                          </h2>
                        </div>
                        {/* <div className='flex-shrink-0 flex items-center justify-center min-w-32 w-[25%] font-medium text-md text-black'>
                                                <a href="https://www.3xbuilds.com" target="_blank" ><FaDiscord></FaDiscord></a>
                                            </div> */}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Analytics />
    </div>
  );
}
