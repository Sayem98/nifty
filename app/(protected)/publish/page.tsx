"use client"
import { WalletConnectButton } from "@/components/buttons/WalletConnectButton"
import OptionToggle from "@/components/Global/OptionToggle"
import Navbar from "@/components/Home/Navbar"
import { useGlobalContext } from "@/context/MainContext"
import axios from "axios"
import { ethers } from "ethers"
import Image from "next/image"
import { useState, useEffect } from "react"
import { FaFilePdf, FaImage } from "react-icons/fa"
import { FaArrowPointer, FaRegCircleCheck, FaSquareCheck } from "react-icons/fa6"
import { ImCross } from "react-icons/im"
import {useAccount} from 'wagmi'
import abi from "@/utils/abis/templateABI"
import { Loader } from "@/components/Global/Loader"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { TbCircleDashedNumber1, TbCircleDashedNumber2 } from "react-icons/tb"
import { AiOutlineLoading } from "react-icons/ai"
import { useLoading } from "@/components/PageLoader/LoadingContext"
import { useExitAlert } from "@/components/alert/alert"

export default function Home(){

    useExitAlert("Are you sure you want to leave this page? Your progress will be lost. IF A TRANSACTION HAS BEEN CONFIRMED, GOING BACK WILL CAUSE PROBLEMS.");


    const {address} = useAccount();
    const {user, setUser, night} = useGlobalContext();

    const[loading, setLoading] = useState<string>("");

    const[bookName, setBookName] = useState<string>("");
    const[bookDesc, setBookDesc] = useState<string>("");
    const[illustrationArtist, setIllustrationArtist] = useState<string>("")
    const [isbn, setIsbn] = useState<string>("");
    const [pdf, setPdf] = useState<File | null>(null);
    const [cover, setCover] = useState<File | null>(null);

    const[requiredName, setRequiredName] = useState(false);
    const[requiredPdf, setRequiredPdf] = useState(false);


    const[id, setId] = useState("");
    // const [coverDate, setCoverDate] = useState("");
    // const [pdfDate, setPdfDate] = useState("");
    const[characterDesc, setCharacterDesc] = useState(0)
    const[characterName, setCharacterName] = useState(0)
    const[characterArtist, setCharacterArtist] = useState(0)

    const[coverLink, setCoverLink] = useState("");
    const[fileLink, setFileLink] = useState("");

    const [mintPrice, setMintPrice] = useState<number>(0);
    const [maxMints, setMaxMints] = useState<number>(0);
    const [maxMintsPerWallet, setMaxMintsPerWallet] = useState<number>(0);

    const [tokenId, setTokenId] = useState<string>("");

    const[option, setOption] = useState<string>("Upload PDF")

    const[tags, setTags] = useState<Array<string>>([]);

    const[step, setStep] = useState<number>(0);

    const[agree, setAgree] = useState<boolean>(false);


    const router = useRouter()

    const defaultTags:Array<string> = [
        "Adventure",
        "Fantasy",
        "Science Fiction",
        "Mystery",
        "Thriller",
        "Romance",
        "Historical Fiction",
        "Young Adult",
        "Children's Books",
        "Non-Fiction",
        "Self-Help",
        "Biography",
        "Graphic Novels",
        "Horror",
        "Poetry",
        "Comedy",
        "Education",
        "Comics",
        "Short Stories",
        "Other"
      ];

    async function contractSetup(){
        try {
            //@ts-ignore
            if (typeof window?.ethereum !== 'undefined') {

                //@ts-ignore
                await window?.ethereum.request({ method: 'eth_requestAccounts' });

                //@ts-ignore
                const provider = new ethers.providers.Web3Provider(window?.ethereum);
                const signer = provider.getSigner();

                //@ts-ignore
                const contract = new ethers.Contract(user?.contractAdd, abi, signer);
                // console.log("llulululul::",contract);

            return contract;

            }

        }
        catch (err) {
            console.error(err);
        }
    }

    async function getContractDetails(type:string){
        try{
            const contract = await contractSetup();
            // console.log('contract is here broooo: ', contract);
            const id = await contract?.BOOK();
            console.log("heheh id: ", String(id));
            setTokenId(String(id));
            // console.log(id);
            if(id){
                setStep(1);
                handleSubmit(type, id.toString());
            }
        }
        catch(err){
            getContractDetails(type);
            await delay(200);
            console.error(err);
        }
    }

    async function contractPublishBook(id: string, tokenId: string, coverDate:string, pdfDate:string) {
        try {
            const formData = new FormData()

            if(pdfDate !== "" && coverDate !== ""){
                console.log("Inside Publish", tokenId);
                formData.append('name', bookName);
                formData.append('description', bookDesc);
                formData.append('tokenId', tokenId);
                formData.append('wallet', address?.toString() as string);
                formData.append('coverDate', coverDate);
                formData.append('pdfDate', pdfDate);
                formData.append('id', id);
    
                console.log(coverDate, pdfDate);
        
                const res = await axios.post("/api/generateMetadata", formData);
        
                if (res?.data?.success) {
                    setStep(2);
                    const contract = await contractSetup();
                    
                    // Estimate gas
                    const gasEstimate = await contract?.estimateGas.publishBook(
                        Number(tokenId),
                        ethers.utils.parseEther(String(mintPrice)),
                        maxMints,
                        0,
                        "0x0000000000000000000000000000000000000000",
                        maxMintsPerWallet
                    );
        
                    // Add 20% buffer to the gas estimate
                    const gasLimit = gasEstimate?.mul(130).div(100);
        
                    // Get current gas price
                    const gasPrice = await contract?.provider.getGasPrice();
        
                    //@ts-ignore
                    const gasCostWei = gasLimit.mul(gasPrice);
        
                    // Convert gas cost to ether
                    const gasCostEther = ethers.utils.formatEther(gasCostWei);
        
                    console.log(`Estimated gas cost: ${gasCostEther} ETH`);
        
                    // Execute the transaction with the estimated gas
                    const txn = await contract?.publishBook(
                        Number(tokenId),
                        ethers.utils.parseEther(String(mintPrice)),
                        maxMints,
                        0,
                        "0x0000000000000000000000000000000000000000",
                        maxMintsPerWallet,
                        {
                            gasLimit: gasLimit,
                            gasPrice: gasPrice
                        }
                    );
        
                    await txn.wait();
    
                    // setPdfDate("");
                    // setCoverDate("");
        
                    console.log(txn);
        
                    if (txn) {
                        await axios.patch("/api/book/"+id, {isPublished: true, createdAt: Date.now()}).then((res) => {
                            setLoading("");
                            ;
                            router.push("/authors")
                        });
                    }
                }
            }
            else{
                toast.error("Cannot get cover/pdf. Please try again later.")
            }
        } catch (err) {
            router.push("/authors")
            toast.error("There was an error while publishing. Please try again!")
            setLoading("");
            setStep(0);
            console.log(err);
        }
    }


    const removeTag = (indexToRemove: number) => {
        setTags(prevTags => prevTags.filter((_, index) => index !== indexToRemove));
    };

    function delay(ms:number) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

    const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPdf(e.target.files[0]);
        }
    }

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCover(e.target.files[0]);
        }
    }
    

    const handleSubmit = async (publish:string, tokenId:string) => {

        try{
            if(bookName == ""){
                setRequiredName(true);
                setLoading("");
                return;
            }

            if(tags.length == 0){
                setLoading("");
                return;
            }

            if(!pdf && fileLink == ""){
                setRequiredPdf(true);
                setLoading("");
                return;
            }

            if(mintPrice > 0 && mintPrice<0.0001){
                toast.error("Mint price should be greater than 0.0001 ETH")
                setLoading("");
                return;
            }

            if(publish=="publish" && !cover && coverLink == ""){
                toast.error("Upload a cover image!");
                setLoading("");
                return;
            }

            if(!agree){
                toast.error("Please agree to the terms");
                setLoading("");
                return;
            }
    
            if(!tokenId){
                toast.error("Token ID not found");
                setLoading("");
                return;
            }
    
            if(!address){
                toast.error("Please connect wallet");
                setLoading("");
                return;
            }


            
            if(cover && pdf){
                const formData = new FormData();
                formData.append('name', bookName);
                formData.append('isbn', isbn);
                formData.append('description', bookDesc);
                tags.forEach(element => {
                    formData.append('tags', element);
                });
                formData.append('artist', illustrationArtist);
                formData.append('price', mintPrice.toString());
                formData.append('maxMint', maxMints.toString());
                formData.append('maxMintsPerWallet', maxMintsPerWallet.toString());
                formData.append('content', pdf as Blob);
                formData.append('cover', cover as Blob);
                formData.append('contractAdd', String(user?.contractAdd) as string);
                formData.append('tokenId', tokenId);
                formData.append('wallet', address.toString() as string);
                formData.append('publishStatus', publish)
                formData.append("id", id);

                // console.log("TRIGGER NORMAL DRAFT", cover, pdf);
        
                const response = await axios.post("/api/uploadBook", formData);
                if(publish == "publish"){
                    setId(response.data.success._id)
                    console.log("DOWN",response.data.success?.cover.split("/")[6], response.data.success?.pdf.split("/")[6]);
                    // setCoverDate(response.data.success?.cover.split("/")[6])
                    // setPdfDate(response.data.success?.pdf.split("/")[6])
                    setTokenId(response.data.success?.tokenId);
                    contractPublishBook(response.data.success._id, response.data.success?.tokenId, response.data.success?.cover.split("/")[6], response.data.success?.pdf.split("/")[6]);
                    
                }
                else{
                    ;

                    router.push("/authors")
                }

            }

            if(!cover && !pdf && id !== ""){
                // console.log("BULLSAEYEYEY", coverLink, fileLink, bookName, tags, tokenId, address.toString());
                const formData = new FormData();
                formData.append('name', bookName);
                formData.append('isbn', isbn);
                formData.append('description', bookDesc);
                tags.forEach(element => {
                    formData.append('tags', element);
                });
                formData.append('artist', illustrationArtist);
                formData.append('price', mintPrice.toString());
                formData.append('maxMint', maxMints.toString());
                formData.append('maxMintsPerWallet', maxMintsPerWallet.toString());
                formData.append('id', id.toString());
                formData.append('contractAdd', String(user?.contractAdd) as string);
                formData.append('tokenId', tokenId);
                formData.append('wallet', address.toString() as string);

                const response = await axios.patch("/api/uploadBook", formData);
                if(publish == "publish"){
                    setId(response.data.success._id)
                    // setCoverDate(response.data.success?.cover.split("/")[6])
                    // setPdfDate(response.data.success?.pdf.split("/")[6])
                    setTokenId(response.data.success?.tokenId);
                    contractPublishBook(response.data.success._id, response.data.success?.tokenId, response.data.success?.cover.split("/")[6], response.data.success?.pdf.split("/")[6]);
                    
                }
                else{
                    ;

                    router.push("/authors")
                }
            }

            if(!cover && !pdf && id == ""){
                // console.log("BULLSATE");
                const formData = new FormData();
                formData.append('name', bookName);
                formData.append('isbn', isbn);
                formData.append('description', bookDesc);
                tags.forEach(element => {
                    formData.append('tags', element);
                });
                formData.append('artist', illustrationArtist);
                formData.append('price', mintPrice.toString());
                formData.append('maxMint', maxMints.toString());
                formData.append('maxMintsPerWallet', maxMintsPerWallet.toString());
                formData.append('id', id.toString());
                formData.append('contractAdd', String(user?.contractAdd) as string);
                formData.append('tokenId', tokenId);
                formData.append('wallet', address.toString() as string);
        
                const response = await axios.post("/api/uploadBook", formData);
                if(publish == "publish"){
                    setId(response.data.success._id)
                    // setCoverDate(response.data.success?.cover.split("/")[6])
                    // setPdfDate(response.data.success?.pdf.split("/")[6])
                    setTokenId(response.data.success?.tokenId);
                    contractPublishBook(response.data.success._id, response.data.success?.tokenId, response.data.success?.cover.split("/")[6], response.data.success?.pdf.split("/")[6]);
                    
                }
                else{
                    ;

                    router.push("/authors")
                }
            }

            if(cover && !pdf){
                const formData = new FormData();
                formData.append('name', bookName);
                formData.append('isbn', isbn);
                formData.append('description', bookDesc);
                tags.forEach(element => {
                    formData.append('tags', element);
                });
                formData.append('artist', illustrationArtist);
                formData.append('price', mintPrice.toString());
                formData.append('maxMint', maxMints.toString());
                formData.append('maxMintsPerWallet', maxMintsPerWallet.toString());
                formData.append('id', id);
                formData.append('cover', cover as Blob);
                formData.append('contractAdd', String(user?.contractAdd) as string);
                formData.append('tokenId', tokenId);
                formData.append('wallet', address.toString() as string);
        
                const response = await axios.post("/api/uploadBook", formData);
                if(publish == "publish"){
                    setId(response.data.success._id)
                    
                    setTokenId(response.data.success?.tokenId);
                    contractPublishBook(response.data.success._id, response.data.success?.tokenId, response.data.success?.cover.split("/")[6], response.data.success?.pdf.split("/")[6]);

                    
                }
                else{
                    ;

                    router.push("/authors")
                }
            }

            if(!cover && pdf){
                const formData = new FormData();
                formData.append('name', bookName);
                formData.append('isbn', isbn);
                formData.append('description', bookDesc);
                tags.forEach(element => {
                    formData.append('tags', element);
                });
                formData.append('artist', illustrationArtist);
                formData.append('price', mintPrice.toString());
                formData.append('maxMint', maxMints.toString());
                formData.append('maxMintsPerWallet', maxMintsPerWallet.toString());
                formData.append('id', id);
                formData.append('content', pdf as Blob);
                formData.append('contractAdd', String(user?.contractAdd) as string);
                formData.append('tokenId', tokenId);
                formData.append('wallet', address.toString() as string);
        
                const response = await axios.post("/api/uploadBook", formData);

                if(publish == "publish"){
                    setId(response.data.success._id)
                    // console.log(response.data.success, "COVER", response.data.success?.cover.split("/")[6], "DATE", response.data.success?.pdf.split("/")[6])
                    
                    setTokenId(response.data.success?.tokenId);
                    contractPublishBook(response.data.success._id, response.data.success?.tokenId, response.data.success?.cover.split("/")[6], response.data.success?.pdf.split("/")[6]);
                }
                else{
                    ;
                    router.push("/authors")
                }
            }

            
        }

        catch(err){
            toast.error("Failed Interaction")
            setLoading("");
            console.log(err);

        }

    }


    useEffect(()=>{
        setBookName(localStorage?.getItem('name') || "");
        setBookDesc(localStorage?.getItem("description") || "")
        setIllustrationArtist(localStorage?.getItem("artist") || "")
        setCoverLink(localStorage?.getItem("cover") || "");
        setFileLink(localStorage?.getItem("pdf") || "")
        // console.log("THIS IS ID",localStorage?.getItem("id"))
        setId(localStorage?.getItem("id") || "")
        //@ts-ignore
        setTags(JSON.parse(localStorage?.getItem("tags")) || [])

        //@ts-ignore
        setIsbn(localStorage?.getItem("isbn") || "")

        //@ts-ignore
        setMintPrice(localStorage?.getItem("price") || 0)

        //@ts-ignore
        setMaxMints(localStorage?.getItem("maxMint") || 0);
        //@ts-ignore
        setMaxMintsPerWallet(localStorage?.getItem("maxMintsPerWallet") || 0);
        
        // setTokenId(localStorage?.getItem('tokenId') || "");

    },[])

    
  
//   async function tokenChecker() {
//     try {
//       const res = await axios.get("/api/tokenChecker");
//       // console.log(res.data);
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

  const [confirmPublishModal, setConfirmPublishModal] = useState(false);


    return(
        <div className={`md:px-16 pt-10 max-md:px-4 w-screen min-h-screen flex flex-col items-start justify-start dark:text-white dark:bg-nifty-black text-black bg-white`}>
            {/* <div className="flex w-screen z-[1000] justify-end absolute">
               <Navbar/>
            </div> */}
            <div className={`w-screen h-screen fixed top-0 left-0 z-[-1] dark:bg-nifty-black bg-white`}></div>

            <div className={` ${confirmPublishModal ? "translate-y-0" : "-translate-y-[300rem]"} z-[500] duration-200 w-screen h-screen fixed top-0 left-0 backdrop-blur-xl flex items-center justify-center`}>
                <div className={`w-80 p-4 rounded-xl dark:bg-[#313131] bg-white shadow-xl shadow-black/30`}>
                    <h2 className="text-xl font-bold">Confirm</h2>
                    <h2 className="text-nifty-gray-1 text-sm my-4"><b>Note:</b> Once published, nothing but its price and mint details can be changed</h2>

                    <div className="flex gap-2">
                        <button className="bg-black text-white w-1/2 h-10 rounded-lg font-bold hover:-translate-y-1 duration-200" onClick={()=>{setConfirmPublishModal(false); setLoading("publish"); getContractDetails("publish")}}>Publish</button>
                        <button className="bg-gray-200 text-black w-1/2 h-10 rounded-lg font-bold hover:-translate-y-1 duration-200" onClick={()=>{setConfirmPublishModal(false);}}>Cancel</button>
                    </div>

                </div>
            </div>

            {loading != "" && <div className="w-screen fixed top-0 left-0 z-[10] h-screen backdrop-blur-xl flex items-center justify-center">
                    <div className={`dark:bg-[#313131] bg-white w-96 shadow-xl shadow-black/30 rounded-xl p-4`}>
                        <h2 className="text-2xl font-bold" >Steps</h2>
                        <p className="text-xs text-red-500">Do not change your tab during this process</p>
                        {step == 0 ? <ul className="my-2 flex flex-col gap-4">
                            <li><h2 className="flex gap-2 text-md text-nifty-gray-1 font-semibold items-center w-full justify-center" ><TbCircleDashedNumber1 className="w-[10%] text-2xl"/> <span className="w-[70%] flex justify-start">Uploading Files</span></h2></li>
                            {loading == "publish" && <li> <h2 className="flex gap-2 text-md text-nifty-gray-1 font-semibold items-center w-full justify-center" ><TbCircleDashedNumber2 className="w-[10%] text-2xl"/> <span className="w-[70%] flex justify-start">Publishing Book</span></h2></li>}

                        </ul> : <ul className="my-2 flex flex-col gap-4">
                            <li>{step == 1 ? <h2 className="flex gap-2 text-md text-nifty-gray-1 font-semibold items-center w-full justify-center" ><TbCircleDashedNumber1 className="w-[10%] text-2xl"/> <span className="w-[70%] flex justify-start">Uploading Files</span> <AiOutlineLoading className={`w-[20%] dark:text-white text-blackanimate-spin text-2xl`} /> </h2>: <h2 className="flex gap-2 text-md text-nifty-gray-1 font-semibold items-center w-full justify-center" ><FaRegCircleCheck className="w-[10%] text-green-500 text-2xl" /><span className="w-[90%] flex justify-start" >Files successfully upload!</span></h2>}</li>
                            {loading == "publish" && <li>{step == 2 ? <h2 className="flex gap-2 text-md text-nifty-gray-1 font-semibold items-center w-full justify-center" ><TbCircleDashedNumber2 className="w-[10%] text-2xl"/> <span className="w-[70%] flex justify-start">Publishing Book</span> <AiOutlineLoading className={`w-[20%] dark:text-white text-blackanimate-spin text-2xl`} /> </h2>: <h2 className="flex gap-2 text-md text-nifty-gray-1 font-semibold items-center w-full justify-center" ><TbCircleDashedNumber2 className="w-[10%] text-2xl"/> <span className="w-[70%] flex justify-start">Publishing Book</span></h2>}</li>}

                        </ul>}
                    </div>
                </div>}

            <h3 className="text-3xl font-bold">Publish Your Book</h3>

            <OptionToggle options={["Upload PDF"]} selectedOption={option} setOption={setOption} />

            <div className="md:w-[100%] flex max-md:items-center max-md:justify-center max-md:flex-col gap-10 mt-5">
                <div className="relative w-44">
                    {/* Image Holder */}
                    <div className="h-44 md:absolute relative z-[2] w-32 mt-4 bg-gray-500 rounded-lg shadow-lg shadow-black/10">

                            <label htmlFor="dropzone-file2" className=" w-full h-full bg-red-600 group rounded-xl cursor-pointer ">
                                <div className="flex flex-col items-center h-full w-full overflow-hidden justify-center rounded-lg">
                                    {!cover ? <div className=" flex flex-col items-center justify-center w-full h-full rounded-md hover:bg-white/20 duration-200">
                                            
                                            {coverLink !== "" ? <div className=" flex flex-col items-center justify-center w-full h-full rounded-md hover:bg-white/20 duration-200">
                                                <Image width={1080} height={1080} src={coverLink} alt="nothing" className=" object-cover w-full h-full hover:scale-110 hover:opacity-50 duration-150 " />
                                            </div>:
                                            <>
                                            <FaImage className=" text-xl text-white mb-2 " />
                                            <h3 className="w-[80%] font-bold text-base text-center text-white">Upload Cover Image</h3>
                                            </>
                                            }
                                            
                                        </div> :
                                        <div className=" flex flex-col items-center justify-center w-full h-full rounded-md hover:bg-white/20 duration-200">
                                            <Image width={500} height={500} className=" object-cover w-full h-full hover:scale-110 hover:opacity-50 duration-150 " src={!cover ? "" : (cover instanceof File ? URL.createObjectURL(cover) : cover)} alt=""/>
                                        </div>
                                    }
                                </div>
                                <input id="dropzone-file2" type="file" accept='image/*' onChange={handleCoverChange} className="hidden" />
                            </label>
                    </div>
                    <div className="absolute z-[1] h-44 w-32 top-1 left-1 mt-4 bg-white rounded-lg shadow-lg shadow-black/10">
                        
                    </div>

                    
                </div>
                <div className="flex flex-col md:w-[60%]">
                    <div className="flex gap-4">
                        <div className="w-full text-start flex flex-col">
                            <input onKeyDown={(e)=>{if(characterName == 50 && e.key == "Backspace"){setCharacterName((prev)=>(prev-1))}}} placeholder="Enter Book Name..." onChange={(e) => {  setRequiredName(false); if(characterName < 50){setBookName(e.target.value); setCharacterName(e.target.value.length) }}} value={bookName} className={`p-2  placeholder:text-gray-300/40 bg-gray-300/20 w-full peer focus:outline-none ${requiredName ? "border-red-500" : "border-gray-400"} dark:focus:border-white focus:border-black focus:border-2 rounded-xl border-[1px] duration-200 `}></input>
                            <h2 className={`text-sm max-md:text-xs text-semibold text-nifty-gray-1 order-first mt-4 dark:peer-focus:text-white peer-focus:text-black  peer-focus:font-semibold duration-200`}>Book Name <span className="text-xs">{characterName}/50 chars</span><span className="text-red-500 ml-1" >*</span></h2>
                        </div>

                        <div className="w-full text-start flex flex-col">
                            <input placeholder="ISBN Number" onChange={(e) => {  setIsbn(e.target.value) }} value={isbn} className={`p-2  placeholder:text-gray-300/40 bg-gray-300/20 w-full peer focus:outline-none ${requiredName ? "border-red-500" : "border-gray-400"} dark:focus:border-white focus:border-black focus:border-2 rounded-xl border-[1px] duration-200 `}></input>
                            <h2 className={`text-sm max-md:text-xs text-semibold text-nifty-gray-1 order-first mt-4 dark:peer-focus:text-white peer-focus:text-black peer-focus:font-semibold duration-200`}>ISBN</h2>
                        </div>

                    </div>

                    <div className="w-full text-start flex flex-col">
                        <textarea onKeyDown={(e)=>{if(characterDesc == 250 && e.key == "Backspace"){setCharacterDesc((prev)=>(prev-1))}}} placeholder="Description..." onChange={(e) => { if(characterDesc < 250){setBookDesc(e.target.value); setCharacterDesc(e.target.value.length) }}} value={bookDesc} className={`p-2  placeholder:text-gray-300/40 bg-gray-300/20 w-full peer focus:outline-none ${requiredName ? "border-red-500" : "border-gray-400"} dark:focus:border-white focus:border-black focus:border-2 h-64 rounded-xl border-[1px] duration-200 `}></textarea>
                        <h2 className={`text-sm max-md:text-xs text-semibold text-nifty-gray-1 order-first mt-4 dark:peer-focus:text-white peer-focus:text-black peer-focus:font-semibold duration-200`}>Book Description <span className="text-xs">{characterDesc}/250 chars</span></h2>
                    </div>

                    <div className="w-full text-start flex flex-col">
                        <div className="flex flex-wrap gap-1 my-2">
                        {defaultTags.map((item:string)=>(
                            <button disabled={tags.length == 5} onClick={()=>{if(!tags.includes(item))setTags((prev)=>[...prev, item])}} className={`py-2 w-32 px-2 hover:scale-105 duration-200 ${tags.includes(item) && "brightness-125"} hover:brightness-105 rounded-xl flex gap-2 items-center justify-center ${tags.length ==5 && "opacity-60"} bg-gray-300 border-2 border-gray-500 font-semibold text-center text-gray-500 text-xs`}>
                            {item}
                            </button>
                        ))}
                        </div>
                        <h2 className="text-sm max-md:text-xs text-semibold text-nifty-gray-1 order-first mt-4 peer-focus:text-black peer-focus:font-semibold duration-200">Tags (select upto 5)<span className="text-red-500 ml-1" >*</span></h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {tags.map((item, i)=>(
                                <div className="py-2 min-w-20 px-2 rounded-xl flex gap-2 items-center justify-center bg-gray-300 border-2 border-gray-500 font-semibold text-center text-gray-500 text-xs">
                                    {item}
                                    <button onClick={()=>{removeTag(i)}} className="hover:text-white duration-200" ><ImCross/></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-full text-start flex flex-col">
                        <input placeholder="Pablo Picasso" onKeyDown={(e)=>{if(characterArtist == 20 && e.key == "Backspace"){setCharacterArtist((prev)=>(prev-1))}}} onChange={(e) => { if(characterArtist < 20){setIllustrationArtist(e.target.value); setCharacterArtist(e.target.value.length) }}} value={illustrationArtist} className={`p-2  placeholder:text-gray-300/40 bg-gray-300/20 w-full peer focus:outline-none ${requiredName ? "border-red-500" : "border-gray-400"} dark:focus:border-white focus:border-black focus:border-2 rounded-xl border-[1px] duration-200 `}></input>
                        <h2 className={`text-sm max-md:text-xs text-semibold text-nifty-gray-1 order-first mt-4 dark:peer-focus:text-white peer-focus:text-black peer-focus:font-semibold duration-200`}>Illustration Artist <span className="text-xs">{characterArtist}/20 chars</span></h2>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-full text-start flex flex-col">
                            <input placeholder={`Leave ${0} if free mint`} min={0} type="number" onChange={(e) => {setMintPrice(Number((Number(e.target.value))?.toFixed(4)))}} value={mintPrice} className={`p-2  placeholder:text-gray-300/40 bg-gray-300/20 w-full peer focus:outline-none ${requiredName ? "border-red-500" : "border-gray-400"} dark:focus:border-white focus:border-black focus:border-2 rounded-xl border-[1px] duration-200 `}></input>
                            <h2 className={`text-sm max-md:text-xs text-semibold text-nifty-gray-1 order-first mt-4 dark:peer-focus:text-white peer-focus:text-black peer-focus:font-semibold duration-200`}>Mint Price in ETH (Leave 0 for free mint)</h2>
                        </div>

                        <div className="w-full text-start flex flex-col">
                            <input type="number" min={0} placeholder={`Leave 0 if no max limit`} onChange={(e) => { setMaxMints(Math.round(Number(e.target.value)))}} value={maxMints} className={`p-2  placeholder:text-gray-300/40 bg-gray-300/20 w-full peer focus:outline-none ${requiredName ? "border-red-500" : "border-gray-400"} dark:focus:border-white focus:border-black focus:border-2 rounded-xl border-[1px] duration-200 `}></input>
                            <h2 className={`text-sm max-md:text-xs text-semibold text-nifty-gray-1 order-first mt-4 dark:peer-focus:text-white peer-focus:text-black peer-focus:font-semibold duration-200`}>Max Mints (Leave 0 for no limit)</h2>
                        </div>
                    </div>

                    <div className="w-full text-start flex flex-col">
                        <input type="number" min={0} placeholder={`Leave 0 if no wallet limit`} onChange={(e) => { setMaxMintsPerWallet(Math.round(Number(e.target.value)))}} value={maxMintsPerWallet} className={`p-2  placeholder:text-gray-300/40 bg-gray-300/20 w-full peer focus:outline-none ${requiredName ? "border-red-500" : "border-gray-400"} dark:focus:border-white focus:border-black focus:border-2 rounded-xl border-[1px] duration-200 `}></input>
                        <h2 className={`text-sm max-md:text-xs text-semibold text-nifty-gray-1 order-first mt-4 dark:peer-focus:text-white peer-focus:text-black peer-focus:font-semibold duration-200`}>Max Mints Per Wallet (Leave 0 for no limit)</h2>
                    </div>

                    <div className="flex flex-col items-start justify-center md:justify-start md:w-[40%]">
                        <h2 className="text-sm max-md:text-xs text-semibold text-nifty-gray-1 order-first mt-4 peer-focus:text-black peer-focus:font-semibold duration-200">Upload Pdf<span className="text-red-500 ml-1" >*</span></h2>

                            <div>
                                <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-48 h-48 border-2 ${requiredPdf ? "border-red-500"  : "border-jel-gray-3" } border-dashed group rounded-xl mt-2 cursor-pointer hover:bg-jel-gray-1`}>
                                    <div className="flex flex-col items-center h-full w-full p-2 overflow-hidden justify-center rounded-lg">
                                        {!pdf ? <div className="bg-gray-300 text-gray-500 gap-2 flex flex-col items-center justify-center w-full h-full rounded-xl">
                                                <FaFilePdf className="text-xl" />
                                                <h3 className="w-[80%] text-xs text-center">Use .pdf files only with white background for best readability.</h3>
                                            </div> :
                                            <div className="text-sm max-md:text-xs font-bold group-hover:scale-105 duration-200">
                                                {pdf.name}
                                            </div>
                                        }
                                    </div>
                                    <input id="dropzone-file" type="file" accept='application/pdf' onChange={(e)=>{handlePdfChange(e); setRequiredPdf(false)}} className="hidden" />
                                </label>
                                {/* <button onClick={handleSubmit} disabled={uploading} className=' col-span-2 w-32 py-2 font-medium text-black rounded-xl hover:-translate-y-[0.3rem] duration-200 bg-jel-gray-3 hover:bg-jel-gray-2 text-nowrap mt-2'>{uploading ? "Uploading..." : "Upload"}</button> */}
                            </div>
                        {fileLink!=="" && <a href={fileLink} target="_blank" className="text-md mt-5 ml-4 font-bold flex items-center justify-center h-10 w-40 rounded-lg gap-2 bg-black text-white hover:-translate-y-1 duration-200" >Uploaded <FaArrowPointer/> </a>}
                        </div> 
                </div>

                <div className=" w-[20rem] border-l-2 border-dashed md:fixed top-80 right-4 border-gray-300 text-nifty-gray-1 text-sm max-md:text-xs pl-6">
                    <ul className="list-disc flex flex-col gap-10">
                        <li>
                            <h2><b>Creating</b> a draft requires a pdf</h2>
                        </li>
                        <li>
                            <h2><b>Platform fee of 0.0007 ETH</b> is charged per mint of a book which is independant of the author's earnings</h2>
                        </li>
                        <li>
                            <h2>After creating a draft you can edit it as many times you want</h2>
                        </li>
                    </ul>
                 
                </div>
            </div>

            <div className="w-full flex max-md:flex-col max-md:items-center max-md:justify-center gap-6 mt-20 pb-10 items-center justify-center md:justify-end">
                <div className="flex gap-2 items-center justify-center text-nifty-gray-1">
                    <button onClick={()=>{
                        setAgree((prev)=>(!prev));
                    }} className="border-[1px] h-8 w-8 flex items-center justify-center border-gray-400 rounded-md">
                        {agree && <FaSquareCheck className="h-7 w-7"/>}
                    </button>
                    <h2 className="text-start max-md:w-full" >I agree that have the rights of everything I am publishing</h2>
                </div>
                <button onClick={()=>{setLoading("draft"); getContractDetails("draft")}} className='text-black bg-gray-200 h-10 w-48 font-bold rounded-lg hover:-translate-y-1 px-3 py-1 transform transition duration-200 ease-in-out flex items-center justify-center flex-col gap-0' >Save Draft</button>
                <button onClick={()=>{setConfirmPublishModal(true)}} className='text-white bg-black h-10 w-48 font-bold rounded-lg hover:-translate-y-1 px-3 py-1 transform transition duration-200 ease-in-out flex items-center justify-center flex-col gap-0'>Publish</button>
            </div>

            

        </div>
    )
}