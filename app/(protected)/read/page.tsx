"use client"

import { Worker } from '@react-pdf-viewer/core';
import { Viewer, SpecialZoomLevel, } from '@react-pdf-viewer/core';

import '@react-pdf-viewer/core/lib/styles/index.css';
import { useEffect, useState, useCallback } from 'react';
import { ScrollMode } from '@react-pdf-viewer/core';
import { ProgressBar } from '@react-pdf-viewer/core';

import { toolbarPlugin } from '@react-pdf-viewer/toolbar';
import '@react-pdf-viewer/toolbar/lib/styles/index.css';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CiBookmarkPlus } from 'react-icons/ci';
import { useLoading } from '@/components/PageLoader/LoadingContext';
import { toast } from 'react-toastify';
import { useGlobalContext } from '@/context/MainContext';
import { IoIosBookmark } from 'react-icons/io';

import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { initializeTheme, toggleDarkMode } from '@/toggleDarkMode';

export default function Home() {

    const{data:session} = useSession()
    const [wallet, setWallet] = useState("")
    const router = useRouter();
    const [id, setId] = useState<string>("")
    const [currentPage, setCurrentPage] = useState(0);
    const [bookId, setBookId] = useState<string>("");
    const[pdf, setPdf] = useState<string>("")

    const {user, night, setNight} = useGlobalContext();

    let theme = "dark"

    if(typeof window !== 'undefined'){
      theme = window?.localStorage?.getItem('theme') || 'light';
    }
    
    const [page, setPage] = useState<number>(0);

    const toolbarPluginInstance = toolbarPlugin({
        searchPlugin: {
            keyword: 'PDF'
        },
    });

    const { Toolbar } = toolbarPluginInstance;

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadBook = useCallback(async () => {
        try {
            if (typeof window === 'undefined') return;

            setIsLoading(true);
            setError(null);

            const savedBook = localStorage.getItem('book');
            if (!savedBook) {
                throw new Error('No book data found');
            }

            const book = JSON.parse(savedBook);
            if (!book.pdf) {
                throw new Error('Invalid PDF URL');
            }

            const pdfUrl = new URL(book.pdf);
            setPdf(pdfUrl.toString());
            setBookId(book._id);
            setWallet(localStorage.getItem('address') || "");

        } catch (err) {
            console.error('Error loading book:', err);
            setError(err instanceof Error ? err.message : 'Failed to load PDF');
            router.push('/yourShelf');
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        loadBook();
    }, [loadBook]);

    useEffect(()=>{
        if(bookId != "" && user)
        getBookMark();
    },[bookId, user])

    
    async function addBookmark(){
        try{
            await axios.post("/api/bookmark", {email: session?.user?.email, bookId: bookId, page: currentPage}).then((res)=>{
                toast.success("Bookmark added at page "+Number(currentPage+1))
            })
        }
        catch(err:any){
            console.log(err);
            if(err.response.status == 501){
                toast.error(err.response.data.error);
              }
              else{
                toast.error("Error while adding Bookmark. Try again!")
              }
        }
    }

    async function getBookMark(){
        try{
            await axios.get("/api/bookmark/"+bookId+"-"+user?._id).then((res)=>{
                console.log(res.data.data)
                setPage(res.data.data.page);
            })
        }
        catch(err){
            setPage(0);
            console.log(err);
        }
    }

    if (error) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-white dark:bg-nifty-black">
                <div className="text-center p-8">
                    <h2 className="text-xl font-bold mb-4 dark:text-white">
                        Failed to load PDF
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {error}
                    </p>
                    <button
                        onClick={() => loadBook()}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading || page === undefined) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-white dark:bg-nifty-black">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900 dark:border-white" />
            </div>
        );
    }

    return (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <div className={`w-screen h-screen fixed top-0 left-0 z-[-1] dark:bg-nifty-black bg-white`} />
            <div className={`relative flex items-center justify-center w-screen h-screen pt-20 dark:bg-nifty-black bg-white`}>
                <div className="fixed top-20 z-50 bg-white h-16 px-4 flex items-center justify-center rounded-lg w-[80%]">
                    <Toolbar />
                    {session && (
                        <button 
                            onClick={addBookmark} 
                            className='bg-white hover:bg-gray-100 text-black rounded-md duration-100 flex items-center justify-center w-8 h-8 -translate-y-[0.25rem]'
                        >
                            <IoIosBookmark/>
                        </button>
                    )}
                </div>

                {pdf && (
                    <Viewer
                        theme={theme}
                        onPageChange={(e) => setCurrentPage(e.currentPage || 0)}
                        renderLoader={(percentages: number) => (
                            <div style={{ width: '300px', margin: "50px" }}>
                                <ProgressBar progress={Math.round(percentages)} />
                            </div>
                        )}
                        plugins={[toolbarPluginInstance]}
                        initialPage={page || 0}
                        defaultScale={0.9}
                        fileUrl={pdf}
                    />
                )}
            </div>
        </Worker>
    );
}