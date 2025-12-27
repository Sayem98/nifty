"use client"

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { IoMdWallet } from 'react-icons/io';
import Icon from '../Global/Icon';
import { signOut } from 'next-auth/react';

export const WalletConnectRegister = () => {
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
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus ||
              authenticationStatus === 'authenticated');

          if (!ready) {
            return (
              <div className='w-[15.2rem] h-10 bg-nifty-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center text-nifty-gray-1 text-md animate-pulse'>
                Loading...
              </div>
            );
          }

          return (
            <div className='w-full'>
              {(() => {
                if (!connected) {
                  return (
                    <button onClick={()=>{openConnectModal()}} className='bg-black hover:-translate-y-1 duration-200 w-64 rounded-xl px-6 py-3 text-white font-semibold flex flex-row items-center justify-center gap-2'>
                      <IoMdWallet /> Use Wallet
                    </button>
                  );
                }
                if (chain.unsupported) {
                  return (
                    <button onClick={openChainModal} type="button" className='text-white bg-red-500 hover:bg-red-400 font-bold rounded-lg hover:-translate-y-1 px-3 h-10 transform transition duration-200 ease-in-out flex-col flex items-center justify-center gap-2'>
                      Wrong network
                    </button>
                  );
                }
                return (
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button title='Click to view address' onClick={openAccountModal} type="button" className='flex font-bold hover:-translate-y-1 duration-200 items-center gap-2 justify-center text-white bg-green-500 rounded-lg max-md:text-md w-64 text-lg  h-10 transform transition '>
                      <IoMdWallet/>
                      Connected
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