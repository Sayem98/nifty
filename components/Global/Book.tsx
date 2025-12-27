import React from 'react'
import placeholder from "@/assets/NIFTYTALES.png"
import Image from 'next/image'

const Book = ({img, height, width}:any) => {

  if(!height) height = "48";
  if(!width) width = "36";

  return (
    <div className='w-fit h-fit relative hover:brightness-105 duration-150'>
        <div className={`bg-nifty-gray-1 overflow-hidden rounded w-${width} h-${height} shadow-black/50 shadow relative z-10`}>
            {img ? <Image width={1080} height={1080} src={img} alt="bookcover" className='w-full h-full object-cover overflow-hidden'/>: 
                        <Image width={1080} height={1080} src={placeholder} alt="bookcover" className='w-full h-full object-cover'/>

            }

        </div>
        <div className={`bg-white rounded w-${width} h-${height} shadow-black/20 shadow-md absolute top-1 left-1 z-0`}>
            
        </div>
        <div className={`bg-white rounded w-${width} h-${height} shadow-book absolute top-1 left-1 z-0`}>
            
        </div>
    </div>
  )
}

export default Book