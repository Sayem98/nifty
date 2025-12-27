"use client"

import { useGlobalContext } from "@/context/MainContext";
import axios from "axios";
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import abi from "@/utils/abis/templateABI"
import { RiLoader5Fill } from "react-icons/ri";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import masterABI from "@/utils/abis/masterABI";

export default function Home(){

    const {data:session} = useSession();
    const {user, night} = useGlobalContext();

    const[reportedArr, setReportedArr] = useState([]);
    const [authorArr, setAuthorArr] = useState([])
    const router = useRouter()
    const[loading, setLoading] = useState(false);
    const[whitelistedUsers, setWhitelistedUsers] = useState<Array<UserType>>([]);
    const [owner, setOwner] = useState<string>("");
    const [loadingOwner, setLoadingOwner] = useState(false);

    async function handleOwner(){
        try{
            setLoadingOwner(true)
            const contract = await adminContractSetup();
            const txn = await contract?.transferOwnership(owner);

            await txn.wait();
        }
        catch(err){
            console.log(err);
        }
        finally{
            setLoadingOwner(false)
        }
    }

    async function contractSetup(add:string) {
        try {
            //@ts-ignore
            if (typeof window !== 'undefined' && typeof window?.ethereum !== 'undefined') {

                //@ts-ignore
                await window?.ethereum.request({ method: 'eth_requestAccounts' });

                
                
                console.log(add);
                //@ts-ignore
                const provider = new ethers.providers.Web3Provider(window?.ethereum);
                const signer = provider.getSigner();
                //@ts-ignore
                const contract = new ethers.Contract(add, abi, signer);
                return contract;

            }

        }
        catch (err) {
            console.error(err);
        }
    }

    async function fetchReported(){
        try{
            await axios.get("/api/admin/reportedBooks").then((res)=>{
                setReportedArr(res.data.array);
                // console.log(res.data.array);
            })
        }
        catch(err){
            console.log(err);
        }
    }

    async function fetchAuthors(){
        try{
            await axios.get("/api/admin/getAuthors").then((res)=>{
                setAuthorArr(res.data.array);
                // console.log(res.data.array);
            })
        }
        catch(err){
            console.log(err);
        }
    }

    async function getWhitelistedAddresses(){
        try{
           const res = await axios.get("/api/admin/getAuthors");
           const contract = await adminContractSetup()

           console.log("ALL USER", res);

           const whitelisted:Array<UserType> = [];
           
           await Promise.all(res.data.array?.map(async(item:UserType)=>{
            if(item.wallet!=""){
                try{
                    console.log(item.wallet);
                    const status = await contract?.whiteListed(item.wallet);
                    console.log(status);

                if(status == true){
                    whitelisted.push(item);
                }
                }
                catch(err){
                    console.log(err);
                }

            }
           }))

           setWhitelistedUsers(whitelisted);
        }
        catch(err){
            console.log(err)        
        }
    }

    useEffect(()=>{
        fetchReported();
        fetchAuthors();
        fetchDetails();
        getWhitelistedAddresses();
    },[])

    async function pauseMint(tokenId:number, id:string, contractAdd:string){
        try{
            setLoading(true);
            const contract = await contractSetup(contractAdd);

            const gasEstimate = await contract?.estimateGas.pauseMint(tokenId).catch((err) => { console.log(err) });
                console.log("hello2", gasEstimate);
                // Add a 20% buffer to the gas estimate
                const gasLimit = gasEstimate?.mul(130).div(100);

                // Get current gas price
                const gasPrice = await contract?.provider.getGasPrice();

            const txn = await contract?.pauseMint(tokenId, {
                gasLimit: gasLimit,
                gasPrice: gasPrice
            });

            await txn.wait();

            if(txn){
                await axios.patch("/api/book/"+id,{isPaused: true}).then((res)=>{
                    toast.success("Mint paused for the book!");
                    setLoading(false)
                    disable(id)
                });
            }
        }
        catch(err){
            console.log(err);
            setLoading(false)
            toast.error("Error while pausing mint.");
        }
    }

    async function unpauseMint(tokenId:number, id:string, contractAdd:string){
        try{
            setLoading(true);

            const contract = await contractSetup(contractAdd);

            const gasEstimate = await contract?.estimateGas.unpauseMint(tokenId).catch((err) => { console.log(err) });
                console.log("hello2", gasEstimate);
                // Add a 20% buffer to the gas estimate
                const gasLimit = gasEstimate?.mul(130).div(100);

                // Get current gas price
                const gasPrice = await contract?.provider.getGasPrice();

            const txn = await contract?.unpauseMint(tokenId, {
                gasLimit: gasLimit,
                gasPrice: gasPrice
            });

            await txn.wait();

            if(txn){
                await axios.patch("/api/book/"+id,{isPaused: false}).then((res)=>{
                    toast.success("Mint un-paused for the book!");
                    setLoading(false);
                    enable(id);
                });
            }
        }
        catch(err){
            console.log(err);
            toast.error("Error while un-pausing mint.");
            setLoading(false);

        }
    }

    async function enable(id:string){
        try{
            await axios.patch("/api/book/"+id, {isAdminRemoved: false}).then((res)=>{
                toast.success("Book Enabled");
                fetchReported();
                setLoading(false);

            });
        }
        catch(err){
            console.log(err);
            toast.error("Couldn't enable.")
            setLoading(false);

        }
    }

    async function disable(id:string){
        try{
            await axios.patch("/api/book/"+id, {isAdminRemoved: true}).then((res)=>{
                toast.success("Book Disabled");
                fetchReported()
                setLoading(false);
            });
        }
        catch(err){
            console.log(err);
            toast.error("Couldn't disable.")
            setLoading(false);

        }
    }


    // ADMIN CONTRACT INTERACTION

    async function adminContractSetup() {
        try {
            //@ts-ignore
            if (typeof window?.ethereum !== 'undefined') {
                const add = "0xBA334807c9b41Db493cD174aaDf3A8c7E8a823AF";
                
                //@ts-ignore
                await window?.ethereum.request({ method: 'eth_requestAccounts' });
                
                console.log(add);
                //@ts-ignore
                const provider = new ethers.providers.Web3Provider(window?.ethereum);
                const signer = provider.getSigner();
                //@ts-ignore
                const contract = new ethers.Contract(add, masterABI, signer);
                return contract;

            }

        }
        catch (err) {
            console.error(err);
        }
    }

    async function fetchDetails(){
        try{
            const contract = await adminContractSetup();

            setAuthorFee(Number(ethers.utils.formatEther(await contract?.returnfeeForAuthor())));
            setPlatformFee(Number(ethers.utils.formatEther(await contract?.getFeePerMint())));

        }
        catch(err){
            console.log(err);
        }
    }

    const[addWl, setAddWl] = useState<string>("");
    const[loadingAddWl, setLoadingAddWl] = useState<boolean>(false);

    const[remWl, setRemWl] = useState<string>("");
    const[loadingRemWl, setLoadingRemWl] = useState<boolean>(false);

    const[authorFee, setAuthorFee] = useState<number>(0);
    const[loadingAuthorFee, setLoadingAuthorFee] = useState<boolean>(false);

    const[platformFee, setPlatformFee] = useState<number>(0);
    const[loadingPlatformFee, setLoadingPlatformFee] = useState<boolean>(false);

    async function handleAddWl(){
        try{
            setLoadingAddWl(true);
            const contract = await adminContractSetup();

            const gasEstimate = await contract?.estimateGas.addWhitelist(addWl).catch((err) => { console.log(err) });

                const gasLimit = gasEstimate?.mul(150).div(100);
                const gasPrice = await contract?.provider.getGasPrice();

            const res = await contract?.addWhitelist(addWl, {
                gasLimit: gasLimit,
                gasPrice: gasPrice
            });

            await res.wait().then((response:any)=>{
                toast.success(addWl+" has been Whitelisted!");
                setLoadingAddWl(false);
            })
        }
        catch(err:any){
            console.log(err);
            setLoadingAddWl(false);
            toast.error("Try again!");
        }
    }

    async function handleRemWl(){
        try{
            setLoadingRemWl(true);
            const contract = await adminContractSetup();

            const gasEstimate = await contract?.estimateGas.removeWhitelist(remWl).catch((err) => { console.log(err) });

            const gasLimit = gasEstimate?.mul(150).div(100);
            const gasPrice = await contract?.provider.getGasPrice();

            const res = await contract?.removeWhitelist(remWl, {
                gasLimit: gasLimit,
                gasPrice: gasPrice
            });

            await res.wait().then((response:any)=>{
                toast.success(remWl+" removed from Whitelist!");
                setLoadingRemWl(false);
                
            })
        }
        catch(err:any){
            console.log(err);
            setLoadingRemWl(false);
            toast.error("Try again!");
        }
    }

    async function handleAuthorFee(){
        try{
            setLoadingAuthorFee(true);
            const contract = await adminContractSetup();

            const gasEstimate = await contract?.estimateGas.setFeeForAuthor(ethers.utils.parseEther(String(authorFee))).catch((err) => { console.log(err) });

            const gasLimit = gasEstimate?.mul(150).div(100);
            const gasPrice = await contract?.provider.getGasPrice();

            const res = await contract?.setFeeForAuthor(ethers.utils.parseEther(String(authorFee)),{
                gasLimit: gasLimit,
                gasPrice: gasPrice
            });

            await res.wait().then((response:any)=>{
                toast.success("New Author fee: "+authorFee+ " ETH");
                setLoadingAuthorFee(false);
            })
        }
        catch(err:any){
            console.log(err);
            setLoadingAuthorFee(false);
            toast.error("Try again!");
        }
    }

    async function handlePlatformFee(){
        try{
            setLoadingPlatformFee(true);
            const contract = await adminContractSetup();

            const gasEstimate = await contract?.estimateGas.setFeePerMint(ethers.utils.parseEther(String(platformFee))).catch((err) => { console.log(err) });

            const gasLimit = gasEstimate?.mul(150).div(100);
            const gasPrice = await contract?.provider.getGasPrice();

            const res = await contract?.setFeePerMint(ethers.utils.parseEther(String(platformFee)),{
                gasLimit: gasLimit,
                gasPrice: gasPrice
            });

            await res.wait().then((response:any)=>{
                toast.success("New Platform fee: "+platformFee+ " ETH");
                setLoadingPlatformFee(false);
            })
        }
        catch(err:any){
            console.log(err);
            setLoadingPlatformFee(false);
            toast.error("Try again!");
        }
    }

    if(session && user?.role == "ADMIN")
    return(
        <div className={`md:px-10 px-4 pt-10 duration-200 dark:bg-nifty-black bg-white : "bg-white"} min-h-screen text-black`}>
            <div className={`w-screen h-screen fixed top-0 left-0 z-[-1] dark:bg-nifty-black bg-white`}></div>

            <h2 className="text-2xl font-bold my-4">Change Owner</h2>
            <div className="flex gap-8 border-b-[1px] border-nifty-gray-1 pb-10">
                <div className="w-1/2">
                    <input onChange={(e) => { setOwner(e.target.value) }} value={owner} className={`p-2  placeholder:text-gray-300/40 bg-gray-300/20 w-full peer focus:outline-none dark:focus:border-white focus:border-black focus:border-2 rounded-xl border-[1px] duration-200 `}></input>
                    <button onClick={handleOwner} disabled={loadingOwner} className="w-32 h-10 rounded-lg bg-black font-bold text-white my-4 hover:-translate-y-1 duration-200">{loadingOwner ? <RiLoader5Fill className="text-xl animate-spin mx-auto"/> : "Submit"}</button>
                </div>

            </div>

            {/* FEE SECTION */}
            <h2 className="text-2xl font-bold my-4">Fees</h2>
            <div className="flex gap-8 border-b-[1px] border-nifty-gray-1 pb-10">
                <div className="w-1/2">
                    <h2 className="text-xl font-bold my-4">Author Fee (ETH)</h2>
                    <input placeholder="0.003 ETH" type="number" min={0} onChange={(e) => { setAuthorFee(Number((Number(e.target.value))?.toFixed(4))) }} value={authorFee} className={`p-2  placeholder:text-gray-300/40 bg-gray-300/20 w-full peer focus:outline-none dark:focus:border-white focus:border-black focus:border-2 rounded-xl border-[1px] duration-200 `}></input>
                    <button onClick={handleAuthorFee} disabled={loadingAuthorFee} className="w-32 h-10 rounded-lg bg-black font-bold text-white my-4 hover:-translate-y-1 duration-200">{loadingAuthorFee ? <RiLoader5Fill className="text-xl animate-spin mx-auto"/> : "Submit"}</button>
                </div>

                <div className="w-1/2">
                    <h2 className="text-xl font-bold my-4">Platform Fee (ETH)</h2>
                    <input placeholder="0.0007 ETH" type="number" min={0} onChange={(e) => { setPlatformFee(Number((Number(e.target.value))?.toFixed(4))) }} value={platformFee} className={`p-2  placeholder:text-gray-300/40 bg-gray-300/20 w-full peer focus:outline-none dark:focus:border-white focus:border-black focus:border-2 rounded-xl border-[1px] duration-200 `}></input>
                    <button onClick={handlePlatformFee} disabled={loadingPlatformFee} className="w-32 h-10 rounded-lg bg-black font-bold text-white my-4 hover:-translate-y-1 duration-200">{loadingPlatformFee ? <RiLoader5Fill className="text-xl animate-spin mx-auto"/> : "Submit"}</button>
                </div>
            </div>


            {/* WL SECTION */}
            <div className=" border-b-[1px] border-nifty-gray-1 pb-10">
                <h2 className="text-2xl font-bold my-4">Whitelists</h2>

                <div className="flex gap-8">
                    <div className="w-1/2">
                        <h2 className="text-xl font-bold my-4">Add WL</h2>
                        <input placeholder="0xe2f..." onChange={(e) => { setAddWl(e.target.value) }} value={addWl} className={`p-2  placeholder:text-gray-300/40 bg-gray-300/20 w-full peer focus:outline-none dark:focus:border-white focus:border-black focus:border-2 rounded-xl border-[1px] duration-200 `}></input>
                        <button onClick={handleAddWl} disabled={loadingAddWl} className="w-32 h-10 rounded-lg bg-black font-bold text-white my-4 hover:-translate-y-1 duration-200">{loadingAddWl ? <RiLoader5Fill className="text-xl animate-spin mx-auto"/> : "Submit"}</button>
                    </div>

                    <div className="w-1/2">
                        <h2 className="text-xl font-bold my-4">Remove WL</h2>
                        <input placeholder="0xe2f..." onChange={(e) => { setRemWl(e.target.value) }} value={remWl} className={`p-2  placeholder:text-gray-300/40 bg-gray-300/20 w-full peer focus:outline-none dark:focus:border-white focus:border-black focus:border-2 rounded-xl border-[1px] duration-200 `}></input>
                        <button onClick={handleRemWl} disabled={loadingRemWl} className="w-32 h-10 rounded-lg bg-black font-bold text-white my-4 hover:-translate-y-1 duration-200">{loadingRemWl ? <RiLoader5Fill className="text-xl animate-spin mx-auto"/> : "Submit"}</button>
                    </div>

                </div>

                {whitelistedUsers?.length > 0 && <div className="flex flex-col items-start mt-8 justify-center md:px-10 px-4">
                <h2 className="text-xl font-bold">Whitelisted</h2>
                <div className='w-full max-w-full overflow-x-auto mx-auto my-5'>
                    <div className='overflow-x-auto '>
                        <div className='min-w-[800px] w-[100%]'> {/* Set a minimum width for the table */}
                            <div className=''>
                                <div className='flex text-center py-2 border-[1px] rounded-t-xl border-gray-300  '>
                                    <div className='flex-shrink-0 min-w-32 w-[15%] font-medium text-md text-nifty-gray-1'>
                                        <h2>ID</h2>
                                    </div>
                                    <div className='flex-shrink-0 min-w-32 w-[15%] font-medium text-md text-nifty-gray-1'>
                                        <h2>Username</h2>
                                    </div>
                                    <div className='flex-shrink-0 min-w-32 w-[70%] font-medium text-md text-nifty-gray-1'>
                                        <h2>Wallet</h2>
                                    </div>
                                </div>

                                <div className="flex flex-col w-full justify-center items-center">
                                    {whitelistedUsers.map((item, i) => (
                                        <div className={`flex w-full text-center border-gray-300 h-12 border-b-[1px] border-x-[1px] ${i+1 == reportedArr.length && "rounded-b-xl"} items-center justify-center`}>
                                            <div className='flex-shrink-0 min-w-32 w-[15%] font-medium text-md  '>
                                                <h2>{i+1}</h2>
                                            </div>
                                            <div className='flex-shrink-0 min-w-32 w-[15%] font-medium text-md  '>
                                                {/* @ts-ignore */}
                                                <h2>{item.username}</h2>
                                            </div>
                                            <div className='flex-shrink-0 min-w-32 w-[70%] font-medium text-md  '>
                                                {/* @ts-ignore */}
                                                <h2>{item.wallet}</h2>
                                            </div>
                                            
                                        </div>
                                    ))}
                                </div>

                            </div>


                        </div>
                    </div>
                </div>
                
            </div>}

            </div>



            {reportedArr?.length > 0 && <div className="flex flex-col items-start mt-8 justify-center md:px-10 px-4">
                <h2 className="text-2xl font-bold">Reports</h2>
                <div className='w-full max-w-full overflow-x-auto mx-auto my-10'>
                    <div className='overflow-x-auto '>
                        <div className='min-w-[800px] w-[100%]'> {/* Set a minimum width for the table */}
                            <div className=''>
                                <div className='flex text-center py-2 border-[1px] rounded-t-xl border-gray-300  '>
                                    <div className='flex-shrink-0 min-w-32 w-[15%] font-medium text-md text-nifty-gray-1'>
                                        <h2>ID</h2>
                                    </div>
                                    <div className='flex-shrink-0 min-w-32 w-[15%] font-medium text-md text-nifty-gray-1'>
                                        <h2>Book</h2>
                                    </div>
                                    <div className='flex-shrink-0 min-w-32 w-[15%] font-medium text-md text-nifty-gray-1'>
                                        <h2>Reports</h2>
                                    </div>
                                    <div className='flex-shrink-0 min-w-32 w-[40%] font-medium text-md text-nifty-gray-1'>
                                        <h2>Reason</h2>
                                    </div>
                                    <div className='flex-shrink-0 min-w-32 w-[15%] font-medium text-md text-nifty-gray-1'>
                                        <h2>Action</h2>
                                    </div>
                                    {/* <div className='flex-shrink-0 min-w-32 w-[25%] font-medium text-md text-nifty-gray-1'>
                                        <h2>Contact</h2>
                                    </div> */}
                                </div>

                                <div className="flex flex-col w-full justify-center items-center">
                                    {reportedArr.map((item, i) => (
                                        <div className={`flex w-full text-center border-gray-300 h-12 border-b-[1px] border-x-[1px] ${i+1 == reportedArr.length && "rounded-b-xl"} items-center justify-center`}>
                                            <div className='flex-shrink-0 min-w-32 w-[15%] font-medium text-md  '>
                                                <h2>{i+1}</h2>
                                            </div>
                                            <div className='flex-shrink-0 min-w-32 w-[15%] font-medium text-md  '>
                                                {/* @ts-ignore */}
                                                <button className="hover:underline duration-200" onClick={()=>{router.push("/books/"+item.id)}} >{item.name.slice(0,10)}{item.name.length > 10 && "..."}</button>
                                            </div>
                                            <div className='flex-shrink-0 min-w-32 w-[15%] font-medium text-md  '>
                                                {/* @ts-ignore */}
                                                <h2>{item.reportNum}</h2>
                                            </div>
                                            <div className='flex-shrink-0 min-w-32 w-[40%] flex items-center justify-center font-medium text-xs  '>
                                                {/* @ts-ignore */}
                                                {item.tagsArr.map((item2)=>(
                                                    <div className={`py-2 w-24 px-2 hover:scale-105 duration-200 hover:brightness-105 rounded-xl flex gap-2 items-center justify-center bg-gray-200 border-2 border-gray-400 font-semibold text-center text-gray-400 text-[0.6rem]`}>
                                                        {item2}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className='flex-shrink-0 min-w-32 w-[15%] font-medium text-md  '>
                                                {/* @ts-ignore */}
                                                {!item.status ? <button className='text-sm font-bold   bg-gray-300 py-1 w-24 rounded-md' onClick={()=>{pauseMint(item.tokenId, item.id, item.contractAdd)}} >{loading ? <RiLoader5Fill className="animate-spin text-xl mx-auto"/> : "Disable"}</button> : <button className='text-sm font-bold   bg-gray-300 py-1 w-24 rounded-md' onClick={()=>{unpauseMint(item.tokenId, item.id, item.contractAdd)}} >{loading ? <RiLoader5Fill className="animate-spin text-xl mx-auto"/> : "Enable"}</button>}
                                            </div>
                                            {/* <div className='flex-shrink-0 flex items-center justify-center min-w-32 w-[25%] font-medium text-md  '>
                                                <a href="https://www.3xbuilds.com" target="_blank" ><FaDiscord></FaDiscord></a>
                                            </div> */}
                                            
                                        </div>
                                    ))}
                                </div>

                            </div>


                        </div>
                    </div>
                </div>
                
            </div>}

            <div className="flex flex-col items-start mt-8 justify-center md:px-10 px-4">
                <h2 className="text-2xl font-bold">Users</h2>

                {authorArr &&
                    <div className='w-full max-w-full overflow-x-auto mx-auto my-10'>
                    <div className='overflow-x-auto '>
                        <div className='min-w-[800px] w-[100%]'>
                            <div className=''>
                                <div className='flex text-center py-2 border-[1px] rounded-t-xl border-gray-300  '>
                                    <div className='flex-shrink-0 min-w-32 w-[15%] font-medium text-md text-nifty-gray-1'>
                                        <h2>ID</h2>
                                    </div>
                                    <div className='flex-shrink-0 min-w-32 w-[25%] font-medium text-md text-nifty-gray-1'>
                                        <h2>Name</h2>
                                    </div>
                                    <div className='flex-shrink-0 min-w-32 w-[15%] font-medium text-md text-nifty-gray-1'>
                                        <h2>Collection</h2>
                                    </div>
                                    <div className='flex-shrink-0 min-w-32 w-[30%] font-medium text-md text-nifty-gray-1'>
                                        <h2>Wallet</h2>
                                    </div>
                                    <div className='flex-shrink-0 min-w-32 w-[15%] font-medium text-md text-nifty-gray-1'>
                                        <h2>Books</h2>
                                    </div>
                                    {/* <div className='flex-shrink-0 min-w-32 w-[25%] font-medium text-md text-nifty-gray-1'>
                                        <h2>Contact</h2>
                                    </div> */}
                                </div>

                                <div className="flex flex-col w-full justify-center items-center">
                                    {authorArr.map((item:UserType, i) => (
                                        <div className={`flex w-full text-center border-gray-300 h-12 border-b-[1px] border-x-[1px] ${i+1 == reportedArr.length && "rounded-b-xl"} items-center justify-center`}>
                                            <div className='flex-shrink-0 min-w-32 w-[15%] font-medium text-md  '>
                                                <h2>{i+1}</h2>
                                            </div>
                                            <div className='flex-shrink-0 min-w-32 w-[25%] font-medium text-md  '>
                                                {/* @ts-ignore */}
                                                <h2 >{item?.username.slice(0,20)}{item?.username.length > 20 && "..."}</h2>
                                            </div>
                                            <div className='flex-shrink-0 min-w-32 w-[15%] font-medium text-md  '>
                                                {/* @ts-ignore */}
                                                <button className="hover:underline duration-200" onClick={()=>{router.push("/authors/"+item?.wallet)}} >{item?.collectionName}</button>
                                            </div>
                                            <div className='flex-shrink-0 min-w-32 w-[30%] flex items-center justify-center font-medium text-xs  '>
                                                {/* @ts-ignore */}
                                                <h2>{item?.wallet}</h2>
                                            </div>
                                            <div className='flex-shrink-0 min-w-32 w-[15%] font-medium text-md  '>
                                                {/* @ts-ignore */}
                                                <h2>{item?.yourBooks?.length}</h2>
                                            </div>
                                            {/* <div className='flex-shrink-0 flex items-center justify-center min-w-32 w-[25%] font-medium text-md  '>
                                                <a href="https://www.3xbuilds.com" target="_blank" ><FaDiscord></FaDiscord></a>
                                            </div> */}
                                            
                                        </div>
                                    ))}
                                </div>

                            </div>


                        </div>
                    </div>
                </div>
                
                }
            </div>
        </div>
    )
}