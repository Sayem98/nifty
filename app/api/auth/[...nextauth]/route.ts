import User from "@/schemas/userSchema";
import { connectToDB } from "@/utils/db";
import NextAuth from "next-auth";
import jwt from "jsonwebtoken";
import { walletAuthProvider } from "../../walletAuthProvider/credsProvider";
import { revalidatePath } from "next/cache";
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: 'anonymous',
      name: 'Anonym',
      credentials: {},
      //@ts-ignore
      authorize: async () => {
        const anonymousUser = {
          id: String(Date.now()),
          name: `anon-${String(Date.now()).substring(0,10)}`,
          email: `anon-${Date.now()}@niftytales`
        };
          return anonymousUser
      }
  }),
    walletAuthProvider,
  ],
  callbacks: {

    async signIn( {user, account} : {user:any, account:any} ) {
      revalidatePath('/', 'layout') 
      await connectToDB();

      if (account.provider === "anonymous") {
        console.log("Anonymous login detected");
        return true;
      }
      
      return true;
    },
    async jwt({ token, user, account }) {

      const dbUser = await User.findOne({
        $or: [
          { email: token.email },
          { wallet: user?.address },
        ]
      });

      if(!dbUser && account?.provider !== "anonymous"){
        return token;
      }

      // Add user id and provider to the token
      if (account?.provider && user) {
        token.provider = account.provider;
        token.id = user.id;

        if (user && 'address' in user) {
          token.walletAddress = user.address;
        }

        else if (account.provider === "anonymous") {

          token.username = user.name;

          token.email = user.email;
          token.role = "ANONYMOUS";
        } 

        // Generate your own access token and refresh token
        const accessToken = jwt.sign(
          { userId: user.id, provider: account.provider },
          // @ts-ignore
          process.env.NEXTAUTH_SECRET,
          { expiresIn: '6h' }
        );

        const refreshToken = jwt.sign(
          { userId: user.id, provider: account.provider },
          // @ts-ignore
          process.env.NEXTAUTH_SECRET,
          { expiresIn: '6h' }
        );

        token.accessToken = accessToken;
        token.refreshToken = refreshToken;

        if(account.provider === "anonymous"){
          return token;
        }

        token.username = dbUser.username;
        token.role = dbUser.role || 'USER';
        token.email = dbUser.email;
        token.picture = dbUser.profileImage;
      }
      return token;
    },
    async session({ session, token }:any) {
      // console.log("SESSION",session, token);
      // console.log('tokennnn: ', token);
      // Attach access token and refresh token to the session
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.role = token.role;
      session.image = token.picture;

      session.user = {name: token.username, email:token.email};

      session.walletAddress = token.walletAddress;



      // console.log('ssssss: ', session)
      return session;
    },
    async redirect() {
      // console.log("METAMASK", baseUrl);
      return `${process.env.REDIRECT_URL}/explore`
    }
  }
});

export { handler as GET, handler as POST };