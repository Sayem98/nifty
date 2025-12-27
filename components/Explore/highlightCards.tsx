"use client"
import { openSans } from "@/utils/font";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLoading } from "../PageLoader/LoadingContext";
import { MdLibraryAddCheck } from "react-icons/md";
import Icon from "../Global/Icon";
import axios from "axios";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { useGlobalContext } from "@/context/MainContext";
import { useSession } from "next-auth/react";

// Define proper types for better type safety
interface Book {
  _id: string;
  name: string;
  description: string;
  cover: string;
  // Add other fields as needed
}

interface Highlight {
  item: Book;
  readlisted: boolean;
}

interface HighlightCardsProps {
  highlight: Highlight;
}

export default function HighlightCards({ highlight }: HighlightCardsProps) {
    const router = useRouter();
    // Get user and getUser from global context
    const { user, getUser } = useGlobalContext();

    const {data:session} = useSession()
    
    // State variables to track component lifecycle
    const [isReadlisted, setIsReadlisted] = useState<boolean>(highlight.readlisted);
    const [isAddingToReadlist, setIsAddingToReadlist] = useState<boolean>(false);
    const [isMounted, setIsMounted] = useState<boolean>(false);
    
    // When component mounts, mark it as mounted
    useEffect(() => {
        setIsMounted(true);
        
        // Check readlisted status from user data
        if (user?.readlist) {
            const isInReadlist = user.readlist.some((item: any) => 
                item?._id === highlight.item._id
            );
            setIsReadlisted(isInReadlist || highlight.readlisted);
        }
        
        // Cleanup on unmount
        return () => {
            setIsMounted(false);
        };
    }, [user, highlight.item._id, highlight.readlisted]);

    const readlist = async (id: string) => {
        // Don't proceed if we're already processing or component is unmounting
        if (isAddingToReadlist || !isMounted) return;
        
        try {
            setIsAddingToReadlist(true);
            
            await axios.post("/api/readlist", { 
                email: session?.user?.email, 
                bookId: id 
            });
            
            // Only update state if component is still mounted
            if (isMounted) {
                setIsReadlisted(true);
                toast.success("Added to Readlist!");
                
                // Use function form of getUser to avoid stale closures
                await getUser();
            }
        }
        catch (err: any) {
            // Only show errors if component is still mounted
            if (isMounted) {
                console.log(err);
                if (err.response?.status === 501) {
                    toast.error(err.response.data.error);
                }
                else {
                    toast.error("Error while adding to readlist. Try again!");
                }
            }
        }
        finally {
            // Only update state if component is still mounted
            if (isMounted) {
                setIsAddingToReadlist(false);
            }
        }
    };

    // Safely handle image loading
    const [coverLoaded, setCoverLoaded] = useState(false);

    return (
        <div className='md:w-[450px] max-md:w-[20rem] max-md:h-[25rem] p-4 bg-gray-200 flex flex-row max-md:flex-col items-center justify-start overflow-hidden relative rounded-xl'>
            <div 
                onClick={() => {
                    if (!isAddingToReadlist) {
                        router.push(`/books/${highlight.item._id}`);
                    }
                }} 
                className="md:w-40 md:h-[16.5rem] max-md:w-32 max-md:h-44 flex flex-col cursor-pointer relative items-center duration-200 justify-center"
            >
                <div className="w-40 h-52 max-md:w-32 max-md:h-44 overflow-hidden rounded-lg relative z-30">
                    <Image 
                        src={highlight.item.cover as string} 
                        alt="cover" 
                        width={1080} 
                        height={1080}
                        onLoad={() => setCoverLoaded(true)} 
                        className="w-full h-full object-cover object-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" 
                    />
                </div>
                <div className="w-full h-[13rem] max-md:h-44 shadow-xl shadow-black/40 absolute max-md:top-1 md:top-8 left-1 bg-gray-200 rounded-lg z-[29]">
                </div>
            </div>
            <div className='w-fit relative z-20 pl-5 pt-5 text-white flex flex-col items-start justify-start h-full'>
                <h2 className='text-xl font-bold max-md:text-center'>
                    {highlight.item.name.slice(0, 40)}{highlight.item.name.length > 40 && "..."}
                </h2>
                <p className={openSans.className + ' text-xs font-normal mt-2'}>
                    {highlight.item.description?.substring(0, 150)}{highlight.item.description?.length > 150 && "..."}
                </p>
            </div>
            <div className='w-full h-full absolute top-0 left-0 z-10 bg-black/30 backdrop-blur'></div>
            {coverLoaded && (
                <div className='w-full h-full absolute top-0 left-0 z-0'>
                    <Image 
                        width={1080} 
                        height={1080} 
                        src={highlight.item.cover as string} 
                        alt=""
                        priority={false} 
                        className='object-cover w-full h-full flex items-center justify-center' 
                    />
                </div>
            )}
            <div className='flex flex-row gap-2 max-md:items-center max-md:justify-center md:absolute bottom-8 right-8 z-20'>
                <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        if (!isAddingToReadlist) {
                            router.push(`/books/${highlight.item._id}`);
                        }
                    }} 
                    className='text-nifty-black text-sm font-semibold bg-white hover:bg-nifty-white rounded-lg max-md:w-36 px-4 py-1 md:px-4 md:py-1'
                >
                    View
                </button>
                {(session?.user || user) ? (
                    <button 
                        disabled={isReadlisted || isAddingToReadlist} 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            if (!isReadlisted && !isAddingToReadlist) {
                                readlist(highlight.item._id);
                            }
                        }} 
                        className='text-nifty-black text-sm font-semibold bg-nifty-black rounded-lg w-8 h-8 flex items-center justify-center'
                    >
                        {isAddingToReadlist ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : !isReadlisted ? (
                            <Icon name='addread' className='w-5 pl-1 mt-1' color='white' />
                        ) : (
                            <MdLibraryAddCheck className='text-green-500' />
                        )}
                    </button>) :<span></span>}
            </div>
        </div>
    );
}