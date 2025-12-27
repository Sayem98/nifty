import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/schemas/userSchema";
import { ethers } from "ethers";
import { connectToDB } from "@/utils/db";

// @/utils/walletAuthProvider/credsProvider.ts

export const walletAuthProvider = CredentialsProvider({
  id: "ethereum",
  name: "Ethereum",
  credentials: {
    address: { label: "Address", type: "text" }, // Pass only the address
  },
  async authorize(credentials) {
    if (!credentials?.address) return null;

    await connectToDB();
    const walletAddress = credentials.address.toLowerCase();

    let user = await User.findOne({ wallet: walletAddress });

    if (!user) {
      user = await User.create({
        wallet: walletAddress,
        email: `${walletAddress.slice(0, 6)}@wallet`,
        username: `${walletAddress.slice(0, 6)}-wallet`,
      });
    }

    return {
      id: user._id.toString(),
      address: walletAddress,
      email: user.email,
      name: user.username,
    };
  },
});
