import { useGlobalContext } from "@/context/MainContext";
import axios from "axios";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { toast } from "react-toastify";

export default function TxnFetcher(){

        const[page, setPage] = useState(1);
        const {night} = useGlobalContext();
    
        const[txnData, setTxnData] = useState([]);

    async function fetchTxns(){
        try{
          const res = await axios.get("/api/transaction/get?page=1");
          console.log(res.data.txns)
          setTxnData(res.data.txns)
        }
        catch(err){
          toast.error("Failed to fetch transactions")
        }
      }
  
  
      useEffect(()=>{
        setInterval(()=>{
          fetchTxns()
        }, 5000)
      },[])

    return (
        <div className=' max-lg:mt-10 w-full'>
        <div className="w-full">
              <h3 className="text-2xl font-bold">Latest Mints</h3>
        </div>

       <div className="w-full h-full">
          <div className='border-[1px] rounded-t-lg border-gray-300 bg-nifty-gray-1/20 flex py-2'>
              <div className='w-[25%] font-bold text-center'>By</div>
              <div className='w-[25%] font-bold text-center'>Book</div>
              <div className='w-[25%] font-bold text-center'>Txn</div>
              <div className='w-[25%] font-bold text-center'>Time</div>
          </div>
          <div>
              {txnData && txnData.map((item:any, i)=>(
                <div key={i} className={`border-x-[1px] border-b-[1px] ${i==9 && "rounded-b-lg"} border-gray-300 flex py-2 dark:text-nifty-gray-1 text-black`}>
                    <div className='w-[25%] flex items-center justify-center gap-2 text-xs'>{item.user.profileImage !== "" ? <Image width={540} height={540} src={item.user.profileImage} alt='user' className='w-8 h-8 rounded-full' /> : <div className='w-8 h-8 rounded-full bg-nifty-gray-1/20'></div>}<h2 className='w-32 max-lg:w-20 truncate'>{item.user.username}</h2></div>
                    <Link href={`/books/${item.book._id}`} className='w-[25%] text-center my-auto hover:underline text-xs font-bold'>{item.book.name.substring(0,15)}{item.book.name.length > 15 && "..."}</Link>
                    <Link href={`https://basescan.org/tx/${item.txnHash}`} className='w-[25%] text-center mx-auto text-xs  font-semibold flex justify-center items-center gap-2'>Basescan <FaExternalLinkAlt/></Link>
                    <div className='w-[25%] text-center text-xs my-auto'>{moment(item.createdAt).fromNow()}</div>
                </div>
              ))}
          </div>


        </div>

      </div>
    )
}