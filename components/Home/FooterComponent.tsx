import Link from 'next/link'
import React from 'react'
import { FaTwitter } from 'react-icons/fa'
import { IoMdMail } from 'react-icons/io'

const FooterComponent = () => {
  return (
    <div className='bg-[#1a1a1a] w-screen px-20 pt-20 max-md:px-5 max-md:pt-10 text-white'>
        <h2 className='text-2xl font-bold'> Nifty Tales </h2>
        <div className='grid grid-cols-3 max-md:grid-cols-2 max-md:text-sm max-md:mt-5 mt-10'>
          
            <ul className='flex flex-col gap-2'>
                <li className='max-md:hidden'><a className='flex items-center justify-center gap-2 w-fit' href="https://mail.google.com/mail/?view=cm&fs=1&to=helloniftytales@gmail.com" target='_blank'><IoMdMail/>Email</a></li>
                <li className='md:hidden'><a className='flex items-center justify-center gap-2 w-fit' href="https://mail.google.com/mail/?view=cm&fs=1&to=helloniftytales@gmail.com" target='_blank'><IoMdMail/>Email</a></li>
                <li><a href="https://x.com/niftytales" className='flex items-center justify-center gap-2 w-fit' target='_blank'> <FaTwitter className='text-white'/> Twitter</a></li>
            </ul>

        </div>
        <div className='flex items-center justify-center gap-5 mt-10 pb-10'>
          <h2 className='text-sm flex text-center text-[#b4b4b4]'>All Rights Reserved by NiftyTales ©</h2>
          <Link href="/terms" className='text-sm text-[#b4b4b4] hover:text-gray-200 duration-200'>Terms of Service</Link>
          <Link href="/privacy" className='text-sm text-[#b4b4b4] hover:text-gray-200 duration-200'>Privacy Policy</Link>
        </div>
    </div>
  )
}

export default FooterComponent