"use client";

import { WalletNotRegistered } from "@/components/popups/walletNotRegistered";
import axios from "axios";
import { ethers } from "ethers";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
  useState,
  ReactNode,
  useEffect,
  useCallback
} from "react";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";
import { Alchemy, Network } from 'alchemy-sdk';


type GlobalContextType = {

  user: UserType | null;
  setUser: Dispatch<SetStateAction<UserType | null>>;
  fetch: boolean | false;
  setFetch: Dispatch<SetStateAction<boolean | false>>;
  getUser: () => void;
  ensNameFetcher: () => boolean;
  ensImageFetcher: () => boolean;
  ensImg: string | "";
  setEnsImg: Dispatch<SetStateAction<string | "">>;
  userRaw: UserType | null;
  setUserRaw: Dispatch<SetStateAction<UserType | null>>;
  publishedBooks: Array<BookType> | null;
  setPublishedBooks: Dispatch<SetStateAction<any | "">>;
  recentBooks: Array<BookType> | null;
  setRecentBooks: Dispatch<SetStateAction<any | "">>;
  boosted: Array<BookType> | null;
  setBoosted: Dispatch<SetStateAction<any | "">>;
  night: boolean;
  setNight: Dispatch<SetStateAction<boolean>>
}

const GlobalContext = createContext<GlobalContextType>({
  user: null,
  setUser: () => { },
  fetch: false,
  setFetch: () => {},
  getUser: () => { },
  ensImageFetcher: () => false,
  ensNameFetcher: () => false,
  ensImg: "",
  setEnsImg: () => {},
  userRaw: null,
  setUserRaw: () =>{ },
  publishedBooks : [],
  setPublishedBooks: () =>{},
  recentBooks : [],
  setRecentBooks: () =>{},
  boosted : [],
  setBoosted: () =>{},
  night: false,
  setNight: () => {}
});

export const GlobalContextProvider = ({ children } : { children: ReactNode}) => {

  const {data: session} = useSession();

  const [publishedBooks, setPublishedBooks] = useState<Array<BookType>>([]);
  const [recentBooks, setRecentBooks] = useState<Array<BookType>>([]);
  const [boosted, setBoosted] = useState<Array<BookType>>([]);
  const[night, setNight] = useState<boolean>(false);

  const[slicer, setSlicer] = useState(0);
  const [userRaw, setUserRaw] = useState<UserType | null>(null);

  const[ensImg, setEnsImg] = useState<string>("");

  const {address} = useAccount();
  const pathname = usePathname();

  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null);

  const config = {
    apiKey: "2L082LzB4Kl82BLjvBpMBgEnz3eTuq1v", // Replace with your Alchemy API key
    network: Network.ETH_MAINNET,
  };
  const alchemy = new Alchemy(config);

  async function ensImageFetcher(){
    try{
      //@ts-ignore
      if(user && address && session?.role!= "ANONYMOUS"){

        //@ts-ignore
        const provider = new ethers.getDefaultProvider("https://eth-mainnet.g.alchemy.com/v2/2L082LzB4Kl82BLjvBpMBgEnz3eTuq1v");
        const ensName = await provider.lookupAddress(address);
        if(!ensName){
          return false;
        }

        const ensAvatar = await provider.getAvatar(ensName);

        if(ensAvatar){
          await axios.patch("/api/user/"+user?.email, {profileImage: ensAvatar}).then((res)=>{
            getUser()
            window?.location.reload()
          });
        }
        else{
          const resolver = await provider.getResolver(ensName);
          const avatarText = await resolver.getText('avatar');

          const contractAddress = avatarText.split("/")[1].split(":")[1];
          const tokenId = avatarText.split("/")[2]
  
          const response = await alchemy.nft.getNftMetadata(
            contractAddress,
            tokenId
          );

          if(!response){
            toast.error("ENS Image not found! Set a profile image manually.");
          }
          await axios.patch("/api/user/"+user?.email, {profileImage: response.image.pngUrl}).then((res)=>{
            getUser()
            window?.location.reload()
          });

        };
      return true;
      }
    }
    catch(err){
      console.log(err);
    }
  }

  async function ensNameFetcher(){
    try{
        //@ts-ignore
      if(user && address && session?.role!= "ANONYMOUS"){
        //@ts-ignore
        const provider = new ethers.getDefaultProvider("https://eth-mainnet.g.alchemy.com/v2/2L082LzB4Kl82BLjvBpMBgEnz3eTuq1v");
        const ensName = await provider.lookupAddress(address);

        if(!ensName){
          return false;
        }

        if(ensName){
        await axios.patch("/api/user/"+user?.email, {username: ensName}).then((res)=>{
          window?.location.reload();
        });
      }

    return true;
    }}
    catch(err){
      console.log(err);
    }
  }

  const getUser = useCallback(async () => {
    if (!session?.user?.email) return;
    
    try {
      const res = await axios.get(`/api/user/${session.user.email}`);
      
      console.log("Fetched user in :", res.data.user);
      // Use functional update to ensure latest state
      setUser(res.data.user)
      
      setUserRaw(res.data.unPopulated);
    } catch (err) {
      console.error("Error fetching user:", err);
      setUser(null);
      setUserRaw(null);
    } finally {
    }
  }, [session]);

  const[fetch, setFetch] = useState(false);

  useEffect(()=>{
    if(session)
    {
      getUser();
    }
  },[session])

  const [walletNotRegistered, setWalletNotRegistered] = useState<boolean>(false);

  useEffect(()=>{
    if(user && user.wallet != "" && user.wallet != address){
      setWalletNotRegistered(true);
    }
    else if(user && user.wallet != "" && user.wallet == address){
      setWalletNotRegistered(false);
    }
  },[address])

  useEffect(()=>{
    // console.log(pathname.split("/")[1])
    if(pathname.split("/")[1] !== "publish"){
      localStorage?.removeItem("name");
      localStorage?.removeItem("id");

      localStorage?.removeItem("price");
      localStorage?.removeItem("maxMint");
      localStorage?.removeItem("cover");
      localStorage?.removeItem("artist");
      localStorage?.removeItem("isbn");
      localStorage?.removeItem("description");
      localStorage?.removeItem("tags");
      localStorage?.removeItem("pdf");
      localStorage?.removeItem("maxMintsPerWallet");

      localStorage?.removeItem("coverDate");
      localStorage?.removeItem("pdfDate");


    }
  },[pathname])

  async function getAllBooks() {
    try {
        const trendingBooksResponse = await axios.get("/api/book/?limit=10&type=trending");
        const latestBooksResponse = await axios.get("/api/book/?limit=10&type=latest");
        const boostedBooksResponse = await axios.get("/api/book/?limit=10&type=boosted");

        const publishedBooks = latestBooksResponse.data.data.filter(
            (item: any) => item.isPublished && !item.isHidden && !item.isAdminRemoved
        );
        const boostedBooks = boostedBooksResponse.data.data.filter(
            (item: any) => item.isBoosted && Number(item.isBoosted) > Date.now() && !item.isAdminRemoved
        );

        const trendingBooks = trendingBooksResponse.data.data.filter(
            (item: any) => item.isPublished && !item.isHidden && !item.isAdminRemoved
        );

        setPublishedBooks(publishedBooks);
        setBoosted(boostedBooks);
        setRecentBooks(trendingBooks);
    } catch (err) {
        console.error("Error fetching books:", err);
    }
  }

  useEffect(()=>{
    getAllBooks();
  },[])


  return (
    <GlobalContext.Provider value={{
      // @ts-ignore
      ensImg, setEnsImg, user, setUser, fetch, setFetch, getUser, ensImageFetcher, ensNameFetcher, userRaw, setUserRaw, publishedBooks, setPublishedBooks, recentBooks, setRecentBooks, boosted, setBoosted, night, setNight
    }}>
      {walletNotRegistered && (pathname.split("/")[2] == "makeCollection" || pathname.split("/")[pathname.split("/").length-1] == "authors") && <WalletNotRegistered/>}
      {children}
    </GlobalContext.Provider>
  );
};


export const useGlobalContext = () => useContext(GlobalContext);
