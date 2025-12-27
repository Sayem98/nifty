"use client"

import React, { useEffect, useState } from 'react'
import OptionToggle from '../Global/OptionToggle';
import axios from 'axios';
import User from '@/schemas/userSchema';
import { useSession } from 'next-auth/react';
import { useGlobalContext } from '@/context/MainContext';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { toast } from 'react-toastify';
import { RiLoader5Line } from 'react-icons/ri';
import { useExitAlert } from '../alert/alert';

type StatsType = {
  totalRev: number;
  totalMinted: number;
  totalReaders: number;
}

export const Analytics = () => {

  const [option, setOption] = useState<string>("Daily");

  const [dailyArr, setDailyArr] = useState<Array<any>>([]);
  const [weeklyArr, setWeeklyArr] = useState<Array<any>>([]);
  const [monthlyArr, setMonthlyArr] = useState<Array<any>>([]);
  const [allTimeArr, setAllTimeArr] = useState<Array<any>>([]);

  const[dailyStats, setDailyStats] = useState<StatsType>();
  const[weeklyStats, setWeeklyStats] = useState<StatsType>();
  const[monthlyStats, setMonthlyStats] = useState<StatsType>();
  const[allTimeStats, setAllTimeStats] = useState<StatsType>();

  const[addtime, setAddtime] = useState("");

  const[loading, setLoading] = useState(false);

  const[id, setId] = useState("");
  const[price, setPrice] = useState("");

  const[boostModal, setBoostModal] = useState(false);

  const { data: session } = useSession();
  const { user, night } = useGlobalContext();

  const{address} = useAccount();


  async function fetchDailyAnalytics(){
    try {
      setDailyArr([]);
      //@ts-ignore
      const res = await axios.get("/api/transaction/get/" + user._id);
      var totalRev = 0;
      var totalMinted = 0;
      var totalReaders = 0;
      var arr:any = []
      res.data.allBooks.map((item: any) => {
        const dayFiltered = item.transactions.filter((obj: any) => {
          const date = new Date(obj.createdAt);
          const milliseconds = date.getTime();
          const difference = Date.now() - milliseconds;

          return difference < 86400000;
        })

        const dayFilteredReaders = item.readlists.filter((obj: any) => {
          const date = new Date(obj.createdAt);
          const milliseconds = date.getTime();
          const difference = Date.now() - milliseconds;

          return difference < 86400000;
        })

        const name = dayFiltered[0]?.book?.name || dayFilteredReaders[0]?.book?.name;
        const boost = dayFiltered[0]?.book?.isBoosted || dayFilteredReaders[0]?.book?.isBoosted;
        const id = dayFiltered[0]?.book?._id;
        const revenue:number = dayFiltered[0]?.value * dayFiltered?.length || 0;
        if(revenue)
        totalRev += revenue;
        const minted:number = dayFiltered.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0) || 0;
        totalMinted += minted;
        const readers:number = dayFilteredReaders?.length || 0;
        totalReaders += readers

        if(minted>0 || readers>0){
          arr.push({ name, revenue, minted, readers, id, boost })
        }
      })
      setDailyArr(arr)
      if(totalRev>=0)
      setDailyStats({totalRev, totalMinted, totalReaders});
    }
    catch (err) {
      console.log(err);
    }
  }

  async function fetchWeeklyAnalytics(){
    try {
      setWeeklyArr([]);
      //@ts-ignore
      const res = await axios.get("/api/transaction/get/" + user._id);
      var totalRev = 0;
      var totalMinted = 0;
      var totalReaders = 0;
      var arr:any = []
      res.data.allBooks.map((item: any) => {

        const weekFiltered = item.transactions.filter((obj: any) => {
          const date = new Date(obj.createdAt);
          const milliseconds = date.getTime();
          const difference = Date.now() - milliseconds;

          return difference < 86400000 * 7;

        })

        const weekFilteredReaders = item.readlists.filter((obj: any) => {
          const date = new Date(obj.createdAt);
          const milliseconds = date.getTime();
          const difference = Date.now() - milliseconds;

          return difference < 86400000 * 7;

        })

        const name = weekFiltered[0]?.book?.name || weekFilteredReaders[0]?.book?.name;
        const boost = weekFiltered[0]?.book?.isBoosted || weekFilteredReaders[0]?.book?.isBoosted;
        const id = weekFiltered[0]?.book?._id;
        
        const revenue:number = weekFiltered[0]?.value * weekFiltered?.length || 0;
        if(revenue)
        totalRev += revenue;
        const minted:number = weekFiltered.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0) || 0;
        totalMinted += minted;
        const readers:number = weekFilteredReaders?.length || 0;
        totalReaders += readers

        if(minted>0 || readers>0){
          arr.push({ name, revenue, minted, readers, id, boost })
        }
      })
      setWeeklyArr(arr)
      if(totalRev>=0)
      setWeeklyStats({totalRev, totalMinted, totalReaders});

    }
    catch (err) {
      console.log(err);
    }
  }

  async function fetchMonthlyAnalytics(){
    try {
      setMonthlyArr([]);
      //@ts-ignore
      const res = await axios.get("/api/transaction/get/" + user._id);
      var totalRev = 0;
      var totalMinted = 0;
      var totalReaders = 0;
      var arr:any = [];
      res.data.allBooks.map((item: any) => {

        const monthFiltered = item.transactions.filter((obj: any) => {
          const date = new Date(obj.createdAt);
          const milliseconds = date.getTime();
          const difference = Date.now() - milliseconds;

          return difference < 86400000 * 28;

        })

        const monthFilteredReaders = item.readlists.filter((obj: any) => {
          const date = new Date(obj.createdAt);
          const milliseconds = date.getTime();
          const difference = Date.now() - milliseconds;

          return difference < 86400000 * 28;

        })

        const name = monthFiltered[0]?.book?.name || monthFilteredReaders[0]?.book?.name;
        const boost = monthFiltered[0]?.book?.isBoosted || monthFilteredReaders[0]?.book?.isBoosted;
        const id = monthFiltered[0]?.book?._id;
        const revenue:number = monthFiltered[0]?.value * monthFiltered?.length || 0;
        if(revenue)
        totalRev += revenue;
        const minted:number = monthFiltered.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0) || 0;
        totalMinted += minted;
        const readers:number = monthFilteredReaders?.length||0;
        totalReaders += readers;
        if(minted>0 || readers>0){
          arr.push({ name, revenue, minted, readers, id, boost })
        }
      })
      setMonthlyArr(arr)
      if(totalRev>=0)
      setMonthlyStats({totalRev, totalMinted, totalReaders});

    }
    catch (err) {
      console.log(err);
    }
  }

  async function fetchAllTimeAnalytics(){
    try {
      setAllTimeArr([]);
      //@ts-ignore
      const res = await axios.get("/api/transaction/get/" + user._id);
      var totalRev = 0;
      var totalMinted = 0;
      var totalReaders = 0;
      var arr:any = [];

      res.data.allBooks.map((item: any) => {

        const name = item.transactions[0]?.book?.name || item.readlists[0]?.book?.name;
        const boost = item.transactions[0]?.book?.isBoosted || item.readlists[0]?.book?.isBoosted;

        const id = item.transactions[0]?.book?._id;
        const revenue:number = item.transactions[0]?.value * item?.transactions?.length || 0;
        if(revenue)
        totalRev += revenue
        const minted:number = item.transactions.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0) || 0;
        totalMinted += minted;
        const readers:number = item.readlists?.length||0;
        totalReaders += readers;
        if(minted>0 || readers>0){
          arr.push({ name, revenue, minted, readers, id, boost })
        }
      })
      console.log("ALL TIME", arr);
      setAllTimeArr(arr)

      if(totalRev>=0)
      setAllTimeStats({totalRev, totalMinted, totalReaders});

    }
    catch (err) {
      console.log(err);
    }
  }

  

  async function handleBoost() {
    try {
      setLoading(true);
      if (typeof window?.ethereum !== 'undefined') {
        useExitAlert("Are you sure you want to leave this page? Your progress will be lost. IF A TRANSACTION HAS BEEN CONFIRMED, GOING BACK WILL CAUSE PROBLEMS.");

        await window?.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window?.ethereum);
        const signer = provider.getSigner();
  
        const totalPrice = ethers.BigNumber.from(price);
        const amount1 = totalPrice.mul(80).div(100); // 80%
        const amount2 = totalPrice.mul(20).div(100); // 20%
  
        // console.log("PRICE", ethers.utils.formatEther(totalPrice));
  
        const tx1 = await signer.sendTransaction({
          to: "0x1DbCE30361C2cb8445d02b67A75A97f1700D90A9",
          value: amount1
        });
  
        await tx1.wait();
  
        const tx2 = await signer.sendTransaction({
          to: "0x705b8f77d90Ebab24C1934B49724686b8ee27f5F",
          value: amount2
        });
  
        await tx2.wait();
  
        await axios.patch("/api/book/"+id, {isBoosted: String(Date.now()+Number(addtime))});
        toast.success("Book boosted");
        setLoading(false);
        setBoostModal(false);
      } 
    } catch (err) {
      setLoading(false);
      // await axios.patch("/api/book/"+id, {isBoosted: null});
      toast.error("An error occured")
      console.error(err);
    }
  }

  function formatTimeDifference(boost:any) {
    const now = Date.now();
    if (boost <= now) {
        return "Boost";
    }

    const timeDiff = boost - now;
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
        return `${days}d`;
    } else if (hours > 0) {
        return `${hours}h`;
    } else if (minutes > 0) {
        return `${minutes}m`;
    } else {
        return "< 1m";
    }
}

  useEffect(() => {
    if (user) {
      setDailyArr([]);
      setWeeklyArr([]);
      setMonthlyArr([]);
      setAllTimeArr([]);
      fetchDailyAnalytics()
      fetchWeeklyAnalytics()
      fetchMonthlyAnalytics()
      fetchAllTimeAnalytics()
    }
  }, [user])

  return (
    <div id="analytics" className={`dark:text-white text-black flex flex-col mx-4 md:mx-10 overflow-x-hidden items-start mt-5 pt-10 border-t-[1px] border-gray-300 justify-start`}>

      <div className={`w-screen h-screen fixed top-0 left-0 ${boostModal ? "translate-y-0" : "-translate-y-[100rem]"} backdrop-blur-xl duration-200 flex z-[100] items-center justify-center`}>
          <div className='bg-white shadow-xl shadow-black/30 w-80 rounded-xl p-4 '>
            <h2 className='text-2xl font-bold mb-5'>Duration</h2>
              <div className='flex gap-2 flex-wrap items-center justify-center'>
                    <button onClick={()=>{setPrice("1000000000000000"); setAddtime("86400000")}} className={`flex flex-col ${price == "1000000000000000" && " brightness-125 border-black border-2 "} items-center justify-center w-32 bg-nifty-gray-1/30 hover:scale-105 p-2 rounded-lg duration-200 text-nifty-gray-1-2/80`}>
                      <h2 className='font-bold text-md'>1 Day</h2>
                      <h2 className='font-bold text-sm'>0.001 ETH</h2>
                    </button>
                    <button onClick={()=>{setPrice("2500000000000000"); setAddtime("259200000")}} className={`flex flex-col ${price == "2500000000000000" && " brightness-125 border-black border-2 "} items-center justify-center w-32 bg-nifty-gray-1/30 hover:brightness-110 p-2 rounded-lg duration-200 hover:scale-105 text-nifty-gray-1-2/80`}>
                      <h2 className='font-bold text-md'>3 Days</h2>
                      <h2 className='font-bold text-sm'>0.0025 ETH</h2>
                    </button>
                    <button onClick={()=>{setPrice("5000000000000000"); setAddtime("604800000")}} className={`flex flex-col ${price == "5000000000000000" && " brightness-125 border-black border-2 "} items-center justify-center w-32 bg-nifty-gray-1/30 hover:brightness-110 p-2 rounded-lg duration-200 hover:scale-105 text-nifty-gray-1-2/80`}>
                      <h2 className='font-bold text-md'>1 Week</h2>
                      <h2 className='font-bold text-sm'>0.005 ETH</h2>
                    </button>
                    <button onClick={()=>{setPrice("15000000000000000"); setAddtime("2419200000")}} className={`flex flex-col ${price == "15000000000000000" && " brightness-125 border-black border-2 "} items-center justify-center w-32 bg-nifty-gray-1/30 hover:brightness-110 p-2 rounded-lg duration-200 hover:scale-105 text-nifty-gray-1-2/80`}>
                      <h2 className='font-bold text-md'>1 Month</h2>
                      <h2 className='font-bold text-sm'>0.015 ETH</h2>
                    </button>
              </div>

              <div className='w-full flex gap-2 items-center justify-center mt-5'>
                <button onClick={handleBoost} className="bg-black text-white font-semibold  h-10 w-1/2 rounded-lg hover:-translate-y-1 duration-200" >{loading ?<div className='w-full flex items-center justify-center'><RiLoader5Line className="animate-spin text-xl" /></div> : "Confirm"}</button>
                <button onClick={()=>{setBoostModal(false)}} className="bg-gray-200 font-semibold    h-10 w-1/2 rounded-lg hover:-translate-y-1 duration-200" >Cancel</button>
              </div>
          </div>
        </div>

      <h2 className='text-2xl font-bold' >Analytics</h2>

      <OptionToggle options={["Daily", "Weekly", "Monthly", "All Time"]} selectedOption={option} setOption={setOption} />

      <div className='my-10 flex flex-wrap gap-2 items-center justify-center w-full' >
        <div className='p-6 flex items-start justify-center flex-col md:w-[30%] w-80 rounded-xl border-[1px] border-gray-300' >
          <h2 className='text-xl text-nifty-gray-1'>Total Revenue</h2>
          <h2 className='text-4xl font-bold flex gap-2 items-center'>{option == "Daily" && dailyStats?.totalRev}{option == "Weekly" && weeklyStats?.totalRev}{option == "Monthly" && monthlyStats?.totalRev}{option == "All Time" && allTimeStats?.totalRev} {!dailyStats && !weeklyStats && !monthlyStats && !allTimeStats && <div className='h-12 rounded-lg bg-nifty-gray-1/40 animate-pulse w-24'></div>} ETH</h2>
        </div>

        <div className='p-6 flex items-start justify-center flex-col md:w-[30%] w-80 rounded-xl border-[1px] border-gray-300' >
          <h2 className='text-xl text-nifty-gray-1'>Books Minted</h2>
          <h2 className='text-4xl font-bold flex gap-2 items-center'>{option == "Daily" && dailyStats?.totalMinted}{option == "Weekly" && weeklyStats?.totalMinted}{option == "Monthly" && monthlyStats?.totalMinted}{option == "All Time" && allTimeStats?.totalMinted} {!dailyStats && !weeklyStats && !monthlyStats && !allTimeStats && <div className='h-12 rounded-lg bg-nifty-gray-1/40 animate-pulse w-24'></div>}</h2>
        </div>

        <div className='p-6 flex items-start justify-center flex-col md:w-[30%] w-80 rounded-xl border-[1px] border-gray-300' >
          <h2 className='text-xl text-nifty-gray-1'>Total Views</h2>
          <h2 className='text-4xl font-bold flex gap-2 items-center'>{option == "Daily" && dailyStats?.totalReaders}{option == "Weekly" && weeklyStats?.totalReaders}{option == "Monthly" && monthlyStats?.totalReaders}{option == "All Time" && allTimeStats?.totalReaders} {!dailyStats && !weeklyStats && !monthlyStats && !allTimeStats && <div className='h-12 rounded-lg bg-nifty-gray-1/40 animate-pulse w-24'></div>}</h2>
        </div>
      </div>

      <div className='w-full max-w-full overflow-x-auto mx-auto mb-10'>
        <div className='overflow-x-auto '>
          <div className='min-w-[800px] w-[100%]'> {/* Set a minimum width for the table */}
            <div className='border-[1px] rounded-t-lg border-gray-300'>
              <div className='flex text-center py-2'>
                <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md text-nifty-gray-1'>
                  <h2>ID</h2>
                </div>
                <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md text-nifty-gray-1'>
                  <h2>Book</h2>
                </div>
                <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md text-nifty-gray-1'>
                  <h2>Revenue</h2>
                </div>
                <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md text-nifty-gray-1'>
                  <h2>Minted</h2>
                </div>
                <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md text-nifty-gray-1'>
                  <h2>Views</h2>
                </div>
                <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md text-nifty-gray-1'>
                  <h2>Status</h2>
                </div>
              </div>
            </div>

            <div className='border-x-[1px] border-b-[1px] rounded-b-lg border-gray-300'>
              {option == "Daily" && dailyArr.length > 0 ? dailyArr.map((item, i) => (
                <div key={i} className='flex text-center py-2'>
                  <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md  '>
                    <h2>{i + 1}</h2>
                  </div>
                  <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md  '>
                    <h2>{item.name}</h2>
                  </div>
                  <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md  '>
                    <h2>{item.revenue} ETH</h2>
                  </div>
                  <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md  '>
                    <h2>{item.minted}</h2>
                  </div>
                  <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md  '>
                    <h2>{item.readers}</h2>
                  </div>
                  <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md  '>
                    <button disabled={item.boost > Date.now()} onClick={()=>{setId(item.id); setBoostModal(true)}} className='text-sm font-bold text-black  bg-gray-300 py-1 w-24 rounded-md'>
                      {item.boost > Date.now() ? formatTimeDifference(item.boost) : "Boost"}
                    </button>
                  </div>
                </div>
              )) : <>{option == "Daily" && <div className='flex flex-col h-20 font-bold items-center justify-center w-full text-nifty-gray-1'>No data to display</div>}</>}

              {option == "Weekly" && weeklyArr.length > 0 ? weeklyArr.map((item, i) => (
                <div key={i} className='flex text-center py-2'>
                  <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md  '>
                    <h2>{i + 1}</h2>
                  </div>
                  <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md  '>
                    <h2>{item.name}</h2>
                  </div>
                  <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md  '>
                    <h2>{item.revenue} ETH</h2>
                  </div>
                  <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md  '>
                    <h2>{item.minted}</h2>
                  </div>
                  <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md  '>
                    <h2>{item.readers}</h2>
                  </div>
                  <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md  '>
                    <button disabled={item.boost} onClick={()=>{setId(item.id); setBoostModal(true)}} className='text-sm font-bold text-black  bg-gray-300 py-1 w-24 rounded-md'>
                    {item.boost > Date.now() ? formatTimeDifference(item.boost) : "Boost"}
                    </button>
                  </div>
                </div>
              )):<>{option == "Weekly" && <div className='flex flex-col h-20 font-bold items-center justify-center w-full text-nifty-gray-1'>No data to display</div>}</>}

              {option == "Monthly" && monthlyArr.length > 0 ? monthlyArr.map((item, i) => (
                <div key={i} className='flex text-center py-2'>
                  <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md  '>
                    <h2>{i + 1}</h2>
                  </div>
                  <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md  '>
                    <h2>{item.name}</h2>
                  </div>
                  <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md  '>
                    <h2>{item.revenue} ETH</h2>
                  </div>
                  <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md  '>
                    <h2>{item.minted}</h2>
                  </div>
                  <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md  '>
                    <h2>{item.readers}</h2>
                  </div>
                  <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md  '>
                    <button disabled={item.boost} onClick={()=>{setId(item.id); setBoostModal(true)}} className='text-sm font-bold  text-black bg-gray-300 py-1 w-24 rounded-md'>
                    {item.boost > Date.now() ? formatTimeDifference(item.boost) : "Boost"}
                    </button>
                  </div>
                </div>
              )): <>{option == "Monthly" && <div className='flex flex-col h-20 font-bold items-center justify-center w-full text-nifty-gray-1'>No data to display</div>}</>}

              {option == "All Time" && allTimeArr.length> 0 ? allTimeArr.map((item, i) => (
                <div key={i} className='flex text-center py-2'>
                  <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md '>
                    <h2>{i + 1}</h2>
                  </div>
                  <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md '>
                    <h2>{item.name}</h2>
                  </div>
                  <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md '>
                    <h2>{item.revenue} ETH</h2>
                  </div>
                  <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md '>
                    <h2>{item.minted}</h2>
                  </div>
                  <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md '>
                    <h2>{item.readers}</h2>
                  </div>
                  <div className='flex-shrink-0 min-w-32 w-[16.6%] font-medium text-md '>
                    <button disabled={item.boost} onClick={()=>{setId(item.id); setBoostModal(true)}} className='text-sm font-bold text-black  bg-gray-300 py-1 w-24 rounded-md'>
                      {item.boost > Date.now() ? formatTimeDifference(item.boost) : "Boost"}
                    </button>
                  </div>
                </div>
              )): <>{option == "All Time" && <div className='flex flex-col h-20 font-bold items-center justify-center w-full text-nifty-gray-1'>No data to display</div>}</>}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
