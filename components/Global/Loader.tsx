import React from 'react'
import { RiLoader5Line } from 'react-icons/ri'

export const Loader = () => {
  return (
    <div className="flex z-[100000000000] flex-col gap-4 items-center justify-center w-screen h-screen fixed top-0 left-0 backdrop-blur-2xl">
    <RiLoader5Line className="text-black text-5xl animate-spin"/>
    <h3 className='text-xl font-bold animate-pulse' >Loading...</h3>
    </div>
  )
}
