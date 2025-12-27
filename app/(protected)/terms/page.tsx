import FooterComponent from "@/components/Home/FooterComponent";

export default function Home() {
    return (
    <><div className='w-screen min-h-screen flex flex-col items-start justify-start px-20 py-10 max-md:p-4 bg-white text-black '>
        <h1 className=' max-md:text-center max-md:text-5xl text-6xl font-bold'>Terms of Service</h1>
        <p className="text-sm text-nifty-gray-1">
        Last updated: 04/22/2025
        </p>

        <h2 className='text-lg max-md:text-base max-md:w-[80%] text-gray-600 font-light w-[60%] mt-4'>By using Nifty Tales, you agree to the following:

        </h2>

        <h3 className='text-3xl max-md:text-xl mt-20 font-bold'>Publishing</h3>
        <ul className="w-screen list-disc ml-4">
            <li><h2 className='text-lg max-md:text-base max-md:w-[80%] text-gray-600 font-light w-[60%] mt-4'>You must own the rights to the content you publish. No stolen art, no scraped text, no shady uploads.</h2></li>
            <li><h2 className='text-lg max-md:text-base max-md:w-[80%] text-gray-600 font-light w-[60%] mt-4'>We reserve the right to remove any work that violates copyright laws, promotes hate, or breaks the law.</h2></li>
        </ul>

        <h3 className='text-3xl max-md:text-xl mt-20 font-bold'>Collecting</h3>
        <ul className="w-screen list-disc ml-4">
            <li><h2 className='text-lg max-md:text-base max-md:w-[80%] text-gray-600 font-light w-[60%] mt-4'>NFTs purchased on Nifty Tales are yours—store, sell, or trade them freely.</h2></li>
            <li><h2 className='text-lg max-md:text-base max-md:w-[80%] text-gray-600 font-light w-[60%] mt-4'>We don&apos;t guarantee future value or utility of any book.</h2></li>
        </ul>

        <h3 className='text-3xl max-md:text-xl mt-20 font-bold'>Wallets & Blockchain</h3>
        <ul className="w-screen list-disc ml-4">
            <li><h2 className='text-lg max-md:text-base max-md:w-[80%] text-gray-600 font-light w-[60%] mt-4'>You are responsible for your wallet and private keys. We can&apos;t recover lost wallets.</h2></li>
            <li><h2 className='text-lg max-md:text-base max-md:w-[80%] text-gray-600 font-light w-[60%] mt-4'>Blockchain transactions are irreversible—make sure you double-check before publishing or buying.</h2></li> 
        </ul>

        <h3 className='text-3xl max-md:text-xl mt-20 font-bold'>Liability</h3>
        <ul className="w-screen list-disc ml-4">
            <li><h2 className='text-lg max-md:text-base max-md:w-[80%] text-gray-600 font-light w-[60%] mt-4'>Nifty Tales is not liable for user-uploaded content or any third-party links or interactions.</h2></li>
            <li><h2 className='text-lg max-md:text-base max-md:w-[80%] text-gray-600 font-light w-[60%] mt-4'>Use at your own risk, and don&apos;t upload anything you wouldn&apos;t want public forever.</h2></li> 
        </ul>
        
    </div>
    <FooterComponent/>
    </>
    )
}