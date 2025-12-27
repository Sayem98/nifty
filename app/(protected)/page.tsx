'use client'
import About from "@/components/Home/About";
import FooterComponent from "@/components/Home/FooterComponent";
import Landing from "@/components/Home/Landing";
import Navbar from "@/components/Home/Navbar";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between -mt-16 bg-white">
      <Landing/>
      <About/>
      <FooterComponent/>
    </main>
  );
}
