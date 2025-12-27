"use client"

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { IoMdWallet } from 'react-icons/io';
// import wallet from "@/assets/WebsiteLanding/logos/wallet.png"
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { useGlobalContext } from '@/context/MainContext';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useSession } from 'next-auth/react';

export const WalletConnectButton = () => {

  const {address} = useAccount();
  const {user, getUser, night} = useGlobalContext();
  const {data:session} = useSession()

  async function updateWallet(){
    try{
      //@ts-ignore
      if(user?.wallet == "" && session?.role != "ANONYMOUS"){
        await axios.patch("/api/user/"+session?.user?.email, {wallet: address}).then((res)=>{
          getUser();
        });
      }
    }
    catch(err){
      toast.error("Could not update user wallet")
      console.log(err);
    }
  }

  useEffect(()=>{
    updateWallet()
  },[address])



  return (
    <div className=''>
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button onClick={openConnectModal} type="button" className='text-white bg-black h-12 w-64 font-bold rounded-lg hover:-translate-y-1 px-3 py-1 transform transition duration-200 ease-in-out flex items-center justify-center flex-col gap-0'>
                    {/* <Image src={wallet} alt="stickerGen" className='w-10'/> */}
                    <h3 className=''>Connect Wallet</h3>
                  </button>
                );
              }
              if (chain.unsupported) {
                return (
                  <div className='w-screen h-screen fixed top-0 left-0 backdrop-blur-xl flex items-center justify-center z-[100000]'>
                  <button onClick={openChainModal} type="button" className='text-white bg-red-500 hover:bg-red-400 font-bold rounded-lg hover:-translate-y-1 px-3 h-10 transform transition duration-200 ease-in-out flex-col flex items-center justify-center gap-2'>
                    Wrong network
                  </button>
                  </div>
                );
              }
              return (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button title='Click to view address' onClick={openAccountModal} type="button" className={`flex bg-transparent font-bold hover:-translate-y-1 text-nowrap duration-200 items-center gap-2 justify-center rounded-lg max-md:w-full text-sm border-2 h-10 dark:border-white dark:text-white border-black text-black px-3 py-1 transform transition`}>
                    {/* <Image src={wallet} alt="stickerGen" className='w-10'/>
                     */}
                     <IoMdWallet/>
                     {account.ensName? account.ensName : account.displayName} 
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
    </div>
  );
};