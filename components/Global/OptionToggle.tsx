"use client"
import { useGlobalContext } from '@/context/MainContext'
import React from 'react'

type OptionToggleProp = {
    options: string[]
    selectedOption: string
    setOption: (option: string) => void
}

const OptionToggle = ({ options, selectedOption, setOption }:OptionToggleProp) => {

  const{night} = useGlobalContext()

  return (
    <div className='flex flex-row items-center justify-start'>
        {options.map((option:string, index:number) => (
            <div key={index} onClick={()=>{setOption(option)}} className={`flex flex-col duration-200 gap-1 items-center justify-center cursor-pointer font-bold ${selectedOption===option ? ' translate-y-1.5 ' : ' text-nifty-gray-2 '} rounded-md   px-4 h-8 ${index==0 && 'pl-0'}`}>
                <h3>{option}</h3>
               { selectedOption===option && <div className='flex flex-row gap-1 w-full'> <div className={`w-full rounded-full h-[3px] dark:bg-white bg-nifty-black`}></div><div className={`w-2 rounded-full h-[3px] dark:bg-white bg-nifty-black`}></div></div>}
            </div>
        ))}
    </div>
  )
}

export default OptionToggle