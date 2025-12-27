"use client"
import { openSans } from '@/utils/font'
import React, { useState } from 'react'
import Icon from '../Global/Icon';
import OptionToggle from '../Global/OptionToggle';
import Book from '../Global/Book';

const PublicLibrary = () => {

    const [isFocused, setIsFocused] = useState(false);
    const [value, setValue] = useState<string>('');

    const [type, setType] = useState('Trending');

  return (
    <div className='px-5 pt-5'>
        <div className='flex flex-row items-center justify-between'>
            <div className=''>
              <h1 className='font-bold text-2xl mb-4'>Public Library</h1>
              <OptionToggle options={['Trending', 'Latest']} selectedOption={type} setOption={setType} />

            </div>
                
        </div>
        <div className='mt-20 flex flex-row gap-10 items-center justify-center'>
              
              <div className=''></div>
        </div>
    </div>
  )
}

export default PublicLibrary