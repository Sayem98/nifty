'use client';

import React, { useEffect } from 'react'


//Context
import { GlobalContextProvider } from '../../context/MainContext';

//Web3
import RainbowProvider from '../rainbow/rainbowKit';
import { SessionProvider } from 'next-auth/react';
import { LoadingProvider } from '@/components/PageLoader/LoadingContext';
import Loader from '@/components/PageLoader/loader';


const Providers = ({ children }) => {

  return (
    <SessionProvider>
        <RainbowProvider>
          {/* <LoadingProvider> */}
            {/* <Loader/> */}
          <GlobalContextProvider>
          {children}
          </GlobalContextProvider>
          {/* </LoadingProvider> */}
        </RainbowProvider>
    </SessionProvider>
  )
}

export default Providers