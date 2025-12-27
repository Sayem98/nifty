"use client"
import React, { useState, useRef, useEffect } from "react"
import { ethers } from "ethers";
import abi from "@/utils/abis/templateABI"
import { bytecode } from "@/utils/bytecode/bytecode";
import { useAccount } from "wagmi";
import { WalletConnectButton } from "@/components/buttons/WalletConnectButton";
import axios from "axios";
import Image from "next/image";
import { useGlobalContext } from "@/context/MainContext";
import { useRouter } from "next/navigation";
import { CiImageOn } from "react-icons/ci";
import { toast } from "react-toastify";
import { useLoading } from "@/components/PageLoader/LoadingContext";
import { AiOutlineLoading } from "react-icons/ai";
import { useExitAlert } from "@/components/alert/alert";
import masterABI from "@/utils/abis/masterABI";
import { WalletConnectRegister } from "@/components/buttons/WalletConnectRegister";

export default function Home() {

    useExitAlert("Are you sure you want to leave this page? Your progress will be lost. IF A TRANSACTION HAS BEEN CONFIRMED, GOING BACK WILL CAUSE PROBLEMS.");


    const [collectionName, setCollectionName] = useState<string>("");
    const [symbol, setSymbol] = useState<string>("");
    const [profileImg, setProfileImg] = useState<File | null>(null);
    const [bannerImg, setBannerImg] = useState<File | null>(null);

    const { address, isDisconnected, isReconnecting, isConnecting } = useAccount();
    const {user, getUser, night} = useGlobalContext();

    const [loading, setLoading] = useState<boolean>(false);
    const[authorFee, setAuthorFee] = useState<number>(0)

    const router = useRouter()

    async function getAuthorFee() {
        try {
            //@ts-ignore
            if (typeof window !== undefined && typeof window?.ethereum !== 'undefined') {
                
                //@ts-ignore
                await window?.ethereum.request({ method: 'eth_requestAccounts' });
                
                //@ts-ignore
                const provider = new ethers.providers.Web3Provider(window?.ethereum);
                const signer = provider.getSigner();
                const user = address;
                //@ts-ignore
                const contract = new ethers.Contract("0xBA334807c9b41Db493cD174aaDf3A8c7E8a823AF", masterABI, signer);

                const wl = await contract?.whiteListed(user);

                if(!wl){
                    const fee = await contract.returnfeeForAuthor();
                    setAuthorFee(Number(ethers.utils.formatEther(fee)));
                }

                else{
                    setAuthorFee(0);
                }
            }
    
        }
        catch (err) {
            setTimeout(getAuthorFee,500);
            console.error(err);
        }
    }


    async function deployContract() {
        try {
            //@ts-ignore
            if (typeof window !== undefined && typeof window?.ethereum !== 'undefined') {

                //@ts-ignore
                await window?.ethereum.request({ method: 'eth_requestAccounts' });

                //@ts-ignore
                const provider = new ethers.providers.Web3Provider(window?.ethereum);

                const signer = provider.getSigner();

                
                const uri = "https://niftytales.s3.us-east-1.amazonaws.com/users/" + address + "/metadata/";
                
                const factory = new ethers.ContractFactory(abi, bytecode, signer);

                const contract = await factory.deploy(collectionName, symbol, uri, { value: ethers.utils.parseEther(String(authorFee)) });
                

                await contract.deployed();
                await axios.patch("/api/user/"+user?.email, {collectionName: collectionName, contractAdd: contract.address})

                getUser()
                ;
                toast.success("Welcome, author!")
                router.push("/authors/");
                
                return true;
            }

        }
        catch (err) {
            console.error(err);
            toast.error("Library could not be created! Try again.")
            setLoading(false);
            return false;

        }
    }

    async function handleSubmit(e: any) {
        setLoading(true);
        e.preventDefault();

        if(!address){
            toast.error("Please connect your wallet");
            setLoading(false);
            return;
        }

        if (!collectionName || !symbol || !profileImg) {
            toast.error("Please fill in all fields and upload an image.");
            setLoading(false);
            return;
        }

        try {
    
                // Create FormData object
                const formData = new FormData();
    
                if(bannerImg){
                    formData.append("bannerImage", bannerImg);
                }
                formData.append("profileImage", profileImg);
                formData.append("wallet", String(address));
    
                //@ts-ignore
    
    
                // Upload to S3 using the API route
                const response = await axios.post('/api/profileCreate', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

    
                if (response.status !== 200) {
                    toast.error("An error occurred while uploading.");
                    setLoading(false);
                    return;
                }
    
                
                if (fileInputRef.current) {
    
                    //@ts-ignore
                    fileInputRef.current.value = "";
                }
                // console.log("timeout started")

                if(response.status == 200){
                    await deployContract();
                }
            

            else{
                toast.error("Library Creation failed!");
                setLoading(false);
            }


            // alert("Collection created successfully!");
        } catch (error) {
            toast.error("An error occurred while creating the collection. Please try again.");
            setLoading(false);
        }
    }

    const fileInputRef = useRef(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setProfileImg(e.target.files[0]);
        }
    };
    
    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setBannerImg(e.target.files[0]);
        }
    };

    useEffect(()=>{
        if(user && user?.contractAdd !== ""){
            ;
            router.push("/authors");
        }
    },[user])

  useEffect(()=>{
    if(address && !isConnecting){
        getAuthorFee();
    }
  },[address])

//   async function tokenChecker() {
//     try {
//       const res = await axios.get("/api/tokenChecker");
//       console.log(res.data);
//     } catch (error) {
//       if (axios.isAxiosError(error) && error.response?.status === 401) {
//         console.log(error, "WTF BRO")
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
        <div className={` gap-10 w-screen min-h-screen md:p-10 p-4 -mt-16 dark:bg-nifty-black dark:text-white bg-white text-black duration-200`}>
            {/* <div className="flex items-center justify-end absolute top-4 w-screen right-4">
                <Navbar/>
            </div> */}
            <div className={`w-screen h-screen fixed top-0 left-0 z-[-1] dark:bg-nifty-black bg-white`}></div>

            {loading && <div className="w-screen h-screen fixed top-0 left-0 backdrop-blur-xl flex items-center justify-center">
                    <div className={`dark:bg-[#313131] bg-white shadow-xl shadow-black/30 w-80 h-20 font-semibold flex gap-4 items-center justify-center text-xl rounded-xl`}><AiOutlineLoading className="animate-spin"/>Creating your Library</div>
                </div>}

            {isDisconnected && !isReconnecting && <div className="w-screen h-screen fixed flex items-center justify-center flex-col gap-4 z-50 backdrop-blur-2xl top-0 left-0">
                <WalletConnectRegister/>
                <h3 className="font-semibold text-xl text-black p-4 rounded-xl shadow-xl shadow-black/30 bg-white">Checking wallet connection</h3>
            </div>}

            <div className="w-full flex md:justify-start justify-center font-bold max-md:mt-16 mt-10">
                <h2 className="text-3xl">Create a Collection</h2>
            </div>

            {user?.contractAdd == "" && <div className="flex max-md:flex-col">

                <div className="flex flex-col items-center h-fit justify-start md:w-[60%] md:border-r-[1px] max-md:border-b-[1px] border-dashed border-gray-300">


                    <form onSubmit={handleSubmit} className="mt-10 md:px-10 px-3 h-full w-full">

                    <div className="flex max-md:flex-col md:items-start items-center justify-center gap-4" >
                        <div className="flex flex-col items-center justify-center md:justify-start md:w-[40%]">
                            <h2 className="text-sm text-nifty-gray-1">Upload a Photo<span className="text-red-500 font-semibold ml-1">*</span></h2>

                            <div>
                                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-48 h-48 border-2 border-jel-gray-3 border-dashed rounded-xl cursor-pointer hover:bg-jel-gray-1">
                                    <div className="flex flex-col items-center h-full w-full p-2 overflow-hidden justify-center rounded-lg">
                                        {!profileImg ?<div className="bg-nifty-gray-1/40 text-nifty-gray-2 w-full h-full flex gap-2 flex-col items-center justify-center rounded-xl" > <svg className={`w-8 h-8 dark:text-white text-gray-500 `} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                        </svg><h2 className={`text-sm text-center px-2 font-semibold dark:text-white text-nifty-gray-2 `} >Upload a photo for your collection</h2></div> :
                                            <Image alt="hello" className='w-full h-full object-cover rounded-xl hover:scale-110 hover:opacity-30 duration-300' width={1000} height={1000} src={!profileImg ? "" : (profileImg instanceof File ? URL.createObjectURL(profileImg) : profileImg)} />}
                                    </div>
                                    <input id="dropzone-file" type="file" accept='image/*' onChange={handleFileChange} className="hidden" />
                                </label>
                            </div>
                        </div>

                        <div className="md:w-[60%]">
                            <div className="w-full text-start flex flex-col">
                                <input placeholder="John's Collection" onChange={(e) => { setCollectionName(e.target.value) }} value={collectionName} className={`p-2  placeholder:text-gray-300/40 bg-gray-300/20 w-full peer focus:outline-none dark:focus:border-white focus:border-black focus:border-2 rounded-xl border-[1px] duration-200 `}></input>
                                <h2 className={`text-sm text-semibold text-nifty-gray-1 order-first mt-4 dark:peer-focus:text-white peer-focus:text-black peer-focus:font-semibold duration-200`}>Name your collection <span className="text-red-500 font-semibold ml-1">*</span></h2>
                            </div>

                            <div className="w-full text-start flex flex-col">
                                <input placeholder="JCN" onChange={(e) => { setSymbol(e.target.value) }} value={symbol} className={`p-2  placeholder:text-gray-300/40 bg-gray-300/20 w-full peer focus:outline-none dark:focus:border-white focus:border-black focus:border-2 rounded-xl border-[1px] duration-200 `}></input>
                                <h2 className={`text-sm text-semibold text-nifty-gray-1 order-first mt-4 dark:peer-focus:text-white peer-focus:text-black peer-focus:font-semibold duration-200`}>Collection Symbol <span className="text-red-500 font-semibold ml-1">*</span></h2>
                            </div>

                        </div>
                    </div>

                    <div className="w-full flex items-center max-md:mt-10 justify-center">
                        <div className="flex flex-col items-center w-[42rem] justify-center mt-10 md:justify-start h-[14rem]">
                                {/* <h2 className="text-sm -translate-y-2 text-nifty-gray-2">Upload a Banner</h2> */}

                                <div className="w-full h-full" >
                                    <label htmlFor="banner-dropzone-file" className="flex rounded-xl flex-col items-center justify-center w-full h-full border-2 border-jel-gray-3 border-dashed  cursor-pointer hover:bg-jel-gray-1">
                                        <div className="flex flex-col items-center h-full w-full p-2 overflow-hidden justify-center rounded-lg">
                                            {!bannerImg ? <div className="w-full h-full bg-nifty-gray-1/40 rounded-xl flex flex-col items-center justify-center">
                                                    <CiImageOn className={`text-2xl dark:text-white text-gray-500 `} />
                                                    <h3 className={`text-sm text-center px-2 font-semibold dark:text-white text-nifty-gray-2 `} >Upload a 1500x500 png image for best quality</h3>
                                                </div> :
                                                <Image alt="hello" className='w-full h-full object-cover rounded-lg hover:scale-110 hover:opacity-30 duration-300' width={1000} height={1000} src={!bannerImg ? "" : (bannerImg instanceof File ? URL.createObjectURL(bannerImg) : bannerImg)} />}
                                        </div>
                                        <input id="banner-dropzone-file" type="file" accept='image/*' onChange={handleBannerChange} className="hidden" />
                                    </label>
                                    {/* <button onClick={handleSubmit} disabled={uploading} className=' col-span-2 w-32 py-2 font-medium text-black rounded-xl hover:-translate-y-[0.3rem] duration-200 bg-jel-gray-3 hover:bg-jel-gray-2 text-nowrap mt-2'>{uploading ? "Uploading..." : "Upload"}</button> */}
                                </div>
                            </div>    
                    </div>

                    <div className="w-full flex items-center justify-center md:justify-end">
                        <button type="submit" className="bg-black text-white md:px-4 md:py-2 px-6 py-3 rounded-xl my-10 hover:scale-105 duration-200">Create</button>
                    </div>

                    </form>
                </div>

                <div className="md:w-[40%] md:px-10 px-3 flex items-center text-nifty-gray-2">
                    <ul className="flex flex-col gap-4 list-disc max-md:my-5">
                        <li>By becoming an author, you are giving niftytales.xyz access to your uploaded images and pdfs</li>
                        <li>Each book minted will have a platform fee attached which is independant of what you earn from each mint.</li>
                        <li>To prevent spamming, there is a fee of <b>{authorFee} ETH </b>for becoming an author.</li>
                    </ul>
                </div>

            </div>}

        </div>
    )
}