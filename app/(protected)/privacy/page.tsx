import FooterComponent from "@/components/Home/FooterComponent";

export default function Home() {
    return (
    <><div className='w-screen min-h-screen flex flex-col items-start justify-start px-20 py-10 max-md:p-4 bg-white text-black '>
        <h1 className=' max-md:text-center max-md:text-5xl text-6xl font-bold'>Privacy Policy</h1>
        <p className="text-sm text-nifty-gray-1">
        Last updated: 04/22/2025
        </p>

        <h2 className='text-lg max-md:text-base max-md:w-[80%] text-gray-600 font-light w-[60%] mt-4'>Nifty Tales respects your privacy. We don&apos;t collect unnecessary data, and we don&apos;t sell your information—ever.
        </h2>

        <h3 className='text-3xl max-md:text-xl mt-20 font-bold'>What We Collect</h3>
        <ul className="w-screen list-disc ml-4">
            <li><h2 className='text-lg max-md:text-base max-md:w-[80%] text-gray-600 font-light w-[60%] mt-4'>Wallet addresses (when you connect to publish or collect)</h2></li>
            <li><h2 className='text-lg max-md:text-base max-md:w-[80%] text-gray-600 font-light w-[60%] mt-4'>Basic analytics (page views, clicks) via privacy-friendly tools</h2></li>
            <li><h2 className='text-lg max-md:text-base max-md:w-[80%] text-gray-600 font-light w-[60%] mt-4'>Optional info you provide (like email if we add a newsletter later)</h2></li>
        </ul>

        <h3 className='text-3xl max-md:text-xl mt-20 font-bold'>What We Don&apos;t Do</h3>
        <ul className="w-screen list-disc ml-4">
            <li><h2 className='text-lg max-md:text-base max-md:w-[80%] text-gray-600 font-light w-[60%] mt-4'>No cookies that track you across the web</h2></li>
            <li><h2 className='text-lg max-md:text-base max-md:w-[80%] text-gray-600 font-light w-[60%] mt-4'>No personal data selling or third-party ad sharing</h2></li>
            <li><h2 className='text-lg max-md:text-base max-md:w-[80%] text-gray-600 font-light w-[60%] mt-4'>No sneaky surveillance</h2></li>
        </ul>

        <h3 className='text-3xl max-md:text-xl mt-20 font-bold'>How we use the data</h3>
        <ul className="w-screen list-disc ml-4">
            <li><h2 className='text-lg max-md:text-base max-md:w-[80%] text-gray-600 font-light w-[60%] mt-4'>To help creators publish and readers collect stories</h2></li>
            <li><h2 className='text-lg max-md:text-base max-md:w-[80%] text-gray-600 font-light w-[60%] mt-4'>To improve the site and spot bugs</h2></li>
            <li><h2 className='text-lg max-md:text-base max-md:w-[80%] text-gray-600 font-light w-[60%] mt-4'>To support onchain features like ownership verification</h2></li>
            <li><h2 className='text-lg max-md:text-base max-md:w-[80%] text-gray-600 font-light w-[60%] mt-4'>If you ever want your info removed or have questions, email us at helloniftytales@gmail.com.</h2></li>
        </ul>
        
    </div>
    <FooterComponent/>
    </>
    )
}