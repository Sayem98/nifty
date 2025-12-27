"use client"

import React, { useEffect } from 'react'
import { banner } from '@/assets/assets'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useLoading } from '../PageLoader/LoadingContext'

const Landing = () => {

  const router = useRouter()
  

  return (
    <div className='w-screen md:h-screen grid grid-cols-2 max-md:grid-cols-1'>
        <div className=' max-md:px-5 max-md:pt-32 md:pl-12 flex flex-col items-start max-sm:items-center justify-center h-full'>
            <h1 className=' max-md:text-center max-md:text-5xl text-6xl font-bold'>Nifty Tales</h1>
            <h2 className=' max-md:text-center max-md:text-2xl text-3xl mt-5'>Own the story. Publish onchain.</h2>
            <h2 className=' max-md:text-center max-md:text-base text-xl text-gray-500 font-light mt-5'>Books, zines, and stories by creators—for collectors. Forever on the blockchain.</h2>
            <button onClick={()=>{router.push("/explore")}} className='bg-[#171717] rounded-lg text-[#eeeeee] md:text-lg font-semibold px-5 h-12 w-52 my-4 max-md:mx-auto'> Explore</button>
        </div>
        <div className='flex h-full'>
            <Image src={banner} alt="banner" className='w-full h-full object-contain'/>
        </div>

    </div>
  )
}

export default Landing