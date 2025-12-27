import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    address?: string
  }
  interface Session {
    walletAddress?: string
  }
}