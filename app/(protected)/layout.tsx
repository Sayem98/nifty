import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";
import Providers from "@/utils/provider/Providers"
import Navbar from "@/components/Home/Navbar";
import { poppins } from "@/utils/font";
import { Bounce, Slide, ToastContainer, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Head from "next/head";
import { useGlobalContext } from "@/context/MainContext";
import { ThemeProvider } from "@/components/themeProvider";


export const metadata: Metadata = {
  title: "NiftyTales",
  description: "Empowering Authors, Engaging Readers",
  openGraph: {
    title: "NiftyTales",
  description: "Empowering Authors, Engaging Readers",
    url: 'https://niftytales.xyz',
    siteName: 'Nifty Tales',
    images: [
      {
        url: 'https://niftytales.xyz/og.png', // Must be an absolute URL
        width: 800,
        height: 600,
      },
      {
        url: 'https://niftytales.xyz/og.png', // Must be an absolute URL
        width: 1800,
        height: 1600,
        alt: 'My custom alt',
      },
    ]
  }
}




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className="dark">
     <script src="./toggleDarkMode.ts"></script>
     {/* <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      storageKey="10xlms-theme"
      forcedTheme="light"
     > */}

      <body className={poppins.className + " overflow-x-hidden w-screen dark:bg-nifty-black bg-white"}>
      <Providers>
        <Navbar/>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover
          theme="dark"
          transition={Slide}
            />
        
          <div className="flex w-screen z-[1000] justify-end fixed top-0">
               {/* <Navbar/> */}
            </div> 
            <div className="mt-16">
              
              {children}
            </div>
        </Providers>
        </body>
     {/* </ThemeProvider> */}
    </html>
  );
}
