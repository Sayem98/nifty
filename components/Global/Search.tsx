import { useGlobalContext } from '@/context/MainContext';
import { useDebouncedValue } from '@mantine/hooks';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useLoading } from '../PageLoader/LoadingContext';
import { toast } from 'react-toastify';

type Props = {

    bringSearchBar: boolean
    setBringSearchBar: (bringSearchBar: boolean) => void
    search: string
    setSearch: (search: string) => void
}
 
 export const Search = ({bringSearchBar, setBringSearchBar, search, setSearch}:Props) => {

    const{user} = useGlobalContext()
    
    const{data:session} = useSession()

    const [debouncedSearch] = useDebouncedValue(search, 200);
    const [searchResults, setSearchResults] = useState<Array<UserType>>([]);

    const [historyUserResults, setHistoryUserResult] = useState<Array<UserType>>([]);
    const [historyBookResults, setHistoryBookResult] = useState<Array<BookType>>([]);

    const[bookHistory, setBookHistory] = useState<Array<BookType>>([]);

    useEffect(()=>{
        setSearchResults([]);
        setHistoryBookResult([]);
        setHistoryUserResult([]);
        setSearch("")
    },[bringSearchBar])

    const getSearchResults = async () => {
        try{
            const res = await axios.get(`/api/search?query=${debouncedSearch}&user=${user?.email}`);
            console.log(res);
            setSearchResults(res.data.user);
            setBookHistory(res.data.book);
        }
        catch(e){
            console.error(e);
        }
    }

    async function setHistoryData(id:string){
        try{
            //@ts-ignore
            if(session?.role != "ANONYMOUS")
            await axios.post("/api/user/history", {search: id});
        }
        catch(err:any){
            console.log(err);
            if(err.response.status == 501){
                toast.error(err.response.data.error);
              }
              else{
                toast.error("Error while changing name. Try again.")
              }
        }
    }


    async function getHistory(){
        try{
            setHistoryUserResult([]);
            setHistoryBookResult([]);
            //@ts-ignore
            if(user && session?.role != "ANONYMOUS"){
                const arrUser:any = [];
                const arrBook:any = []

                await Promise.all(
                    user.searchHistory?.slice(0,4).map(async(item:string)=>{
                        if(item[0] == "U"){
                                const response = await axios.get("/api/user/"+item.slice(1,item.length));
                                arrUser.push(response.data.user);
                            }
                            else if(item[0] == "B"){
                                const response = await axios.get("/api/book/"+item.slice(1,item.length));
                                arrBook.push(response.data.data);
                            }
                    })
                )

                console.log(arrBook, arrUser);
                setHistoryBookResult(arrBook);
                setHistoryUserResult(arrUser);

            }
        }
        catch(err){
            console.log(err);
        }
    }

    useEffect(()=>{
        if(user && bringSearchBar){
            getHistory();
        }
    },[user, bringSearchBar])
    

    useEffect(()=>{
        if(debouncedSearch ){
            setSearchResults([]);
            setBookHistory([]);
            getSearchResults();
        }
    },[debouncedSearch])

    const router = useRouter()

   return (
    <div className={`w-screen backdrop-blur-xl absolute left-0 flex flex-col items-center top-0 justify-start duration-200 transition-all overflow-hidden ${bringSearchBar ? "z-50 h-screen opacity-100": "z-[-50] h-0 opacity-0"} `} >
        <input placeholder='Search authors, books, traits & collections...' className='py-2 px-4 outline-none pointer-events-auto rounded-full w-[50%] border-[1px] border-gray-400 mt-4 relative z-10 focus:ring-0 focus:border-2 focus:border-black duration-200 max-md:w-[90%] shadow-inner' onChange={(e)=>{setSearch(e.target.value)}} value={search} ></input>
        <div onClick={()=>{setBringSearchBar(false)}} className='h-full absolute z-0 w-full'></div>

        <div className='flex flex-col w-[50%] max-md:w-[90%] bg-black/30 mt-2 rounded-xl'>
            {searchResults.length > 0 && <h2 className='w-full py-2 text-white font-bold px-4 border-b-[1px] border-white' >Authors</h2>}
            {searchResults.map((item)=>(
                <button onClick={()=>{setHistoryData("U"+item.email) ;;router.push("/authors/"+item.wallet); setBringSearchBar(false)}} className='px-4 hover:bg-white/20 duration-200 py-4 text-white border-b-2 border-white/50 shadow-xl shadow-black/30 rounded-b-xl relative z-50' >
                    <div className='flex items-center justify-start gap-2'>
                        {/* {console.log(item.profileImage)} */}
                        <Image src={`https://niftytales.s3.us-east-1.amazonaws.com/users/${item?.wallet}/info/profileImage`} alt='img' width={1080} height={1080} className='w-10 border-[1px] border-white h-10 rounded-full' />
                        <div className='flex flex-col items-start justify-center'>
                            <h2 className='text-md font-bold'>{item?.username}</h2>
                            <h3 className='text-xs font-semibold'>Library: {item.collectionName}</h3>
                        </div>
                    </div>
                    
                </button>
            ))}
        </div>

        <div className='flex flex-col w-[50%] max-md:w-[90%] bg-black/30 mt-2 rounded-xl'>
            {bookHistory.length > 0 && <h2 className='w-full py-2 text-white font-bold px-4 border-b-[1px] border-white' >Books</h2>}
            {bookHistory.map((item)=>(
                <button onClick={()=>{setHistoryData("B"+item._id) ;;router.push("/books/"+item._id); setBringSearchBar(false)}} className='px-4 hover:bg-white/20 duration-200 py-4 text-white border-b-2 border-white/50 shadow-xl shadow-black/30 rounded-b-xl relative z-50' >
                    <div className='flex items-center justify-start gap-2'>
                        {/* {console.log(item.profileImage)} */}
                        {/* @ts-ignore */}
                        <Image src={item.cover} alt='img' width={1080} height={1080} className='w-10 object-cover border-[1px] border-white h-10 rounded-full' />
                        <div className='flex flex-col items-start justify-center'>
                            <h2 className='text-md font-bold'>{item.name}</h2>
                            <h3 className='text-xs font-semibold'>Minted: {item.minted}</h3>
                        </div>
                    </div>
                    
                </button>
            ))}
        </div>

        <div className='flex flex-col w-[50%] max-md:w-[90%] bg-black/30 mt-2 rounded-xl'>
            {historyUserResults.length > 0 && <h2 className='w-full py-2 text-white font-bold px-4 border-b-[1px] border-white' >Searched Authors</h2>}
            {historyUserResults.map((item)=>(
                <button onClick={()=>{setHistoryData("U"+item.email) ;;router.push("/authors/"+item.wallet); setBringSearchBar(false)}} className='px-4 hover:bg-white/20 duration-200 py-4 text-white border-b-2 border-white/50 shadow-xl shadow-black/30 rounded-b-xl relative z-50' >
                    <div className='flex items-center justify-start gap-2'>
                        {/* {console.log(item.profileImage)} */}
                        <Image src={`https://niftytales.s3.us-east-1.amazonaws.com/users/${item?.wallet}/info/profileImage`} alt='img' width={1080} height={1080} className='w-10 border-[1px] border-white h-10 rounded-full' />
                        <div className='flex flex-col items-start justify-center'>
                                <h2 className='text-md font-bold'>{item?.username}</h2>
                            <h3 className='text-xs font-semibold'>Library: {item.collectionName}</h3>
                        </div>
                    </div>
                    
                </button>
            ))}
            {historyBookResults.length>0 && <h2 className='w-full py-2 text-white font-bold px-4 border-b-[1px] border-white' >Searched Books</h2>}
            {historyBookResults.map((item)=>(
                <button onClick={()=>{setHistoryData("B"+item._id) ;;("/books/"+item._id); setBringSearchBar(false)}} className='px-4 hover:bg-white/20 duration-200 py-4 text-white border-b-2 border-white/50 shadow-xl shadow-black/30 rounded-b-xl relative z-50' >
                    <div className='flex items-center justify-start gap-2'>
                        {/* {console.log(item.profileImage)} */}
                        {/* @ts-ignore */}
                        <Image src={item?.cover} alt='img' width={1080} height={1080} className='w-10 border-[1px] border-white h-10 rounded-full' />
                        <div className='flex flex-col items-start justify-center'>
                            <h2 className='text-md font-bold'>{item?.name}</h2>
                            <h3 className='text-xs font-semibold'>Minted: {item?.minted}</h3>
                        </div>
                    </div>
                    
                </button>
            ))}
        </div>


    </div>
   )
 }
 