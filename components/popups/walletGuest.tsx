"use client"

import React from 'react'
import { useAccount } from 'wagmi'

export const WalletGuest = () => {

    const {address} = useAccount()

  return (
    <div className='backdrop-blur-xl w-screen h-screen fixed top-0 left-0 z-[1000] flex items-center justify-center'>
        <div className='w-80 bg-white shadow-xl shadow-black/30 rounded-xl p-4 font-semibold'>
            <h2 className='text-md'>You've connected <b>{address?.slice(0,7)}...{address?.slice(address.length-5, address.length)}</b> which is connected to an account. Would you like to log out and connect to that account instead?</h2>
            <h2 className='text-sm'>If not please connect another wallet.</h2>
        </div>
    </div> 
  )
}
