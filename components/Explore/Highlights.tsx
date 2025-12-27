"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import Icon from '../Global/Icon';
import { openSans } from '@/utils/font';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify';
import { useGlobalContext } from '@/context/MainContext';
import { MdLibraryAddCheck } from 'react-icons/md';
import { useLoading } from '../PageLoader/LoadingContext';
import HighlightCards from './highlightCards';


const Highlights = () => {


    const { data: session, status } = useSession();
    const { user, getUser, userRaw } = useGlobalContext();

    const [highlights, setHighlights] = useState<Array<BookType>>([]);

    const fetchHighlights = async () => {
        try {
            await axios.get("/api/book?limit=10").then(async (res) => {

                const userNew = userRaw;

                var arr: any = []

                res.data.data.map((item: BookType) => {
                    if (item.isPublished && !item.isHidden && !item.isAdminRemoved) {
                        arr.push({ item, readlisted: userNew?.readlist.includes(item._id) });
                    }
                })

                setHighlights(arr);


            });
        }
        catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        fetchHighlights();
    }, [user])

    return (
        <div className='w-full p-5'>
            <h2 className='font-bold text-2xl mb-4 ' >Latest Publications</h2>
            <div className='w-full  flex-col flex items-start justify-start noscr'>
                <div className='grid grid-rows-1 md:h-[16.5rem] grid-flow-col gap-2'>
                    {
                        highlights.length == 0 ? <div className='md:h-[16.5rem] flex gap-2'>
                            {[0, 1, 2, 3, 4].map((item) => (
                                <div className='w-[450px] md:h-[16.5rem] max-md:w-[20rem] max-md:h-[25rem] p-8 bg-gray-200 flex flex-row animate-pulse items-center justify-start overflow-hidden relative rounded-xl'>
                                </div>
                            ))}
                        </div> :
                            <>
                                {highlights?.slice(0, 5).map((highlight: any, i) => (
                                    <HighlightCards key={session?.walletAddress+String(i)} highlight={highlight} />))}
                            </>

                    }
                </div>
            </div>
        </div>
    )
}

export default Highlights