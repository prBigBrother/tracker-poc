import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { ensureSchema, upsertUser } from "@/lib/db";

const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN?.toLowerCase();

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: false,
      profile(profile) {
        return {
          id: (profile as any).sub ?? (profile as any).id ?? (profile as any).email,
          name: (profile as any).name,
          email: (profile as any).email?.toLowerCase() ?? null,
          image: (profile as any).picture ?? null,
        } as any;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, profile }) {
      if (user) {
        token.name = user.name ?? token.name;
        token.email = user.email ?? token.email;
        // Prefer mapped user.image, fall back to provider profile.picture
        const image = (user as any)?.image ?? (profile as any)?.picture;
        if (image) (token as any).picture = image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = session.user.name ?? (token.name as string | undefined) ?? null;
        session.user.email = session.user.email ?? (token.email as string | undefined) ?? null;
        (session.user as any).image = (session.user as any).image ?? ((token as any)?.picture as string | undefined) ?? null;
      }
      return session;
    },
    async signIn({ profile, user }) {
      const email = (profile as any)?.email?.toLowerCase() || user?.email?.toLowerCase();
      if (!allowedDomain) return false;
      if (!email) return false;
      return email.endsWith(`@${allowedDomain}`);
    },
    async redirect({ url, baseUrl }) {
      // Always land on the homepage after successful login
      try {
        const u = new URL(url, baseUrl);
        // Prevent open redirects; only allow same-origin
        if (u.origin === baseUrl) return u.toString();
      } catch {}
      return baseUrl + "/";
    },
  },
  events: {
    async signIn({ user }) {
      try {
        const email = user?.email?.toLowerCase() || null;
        if (email) {
          await ensureSchema();
          await upsertUser({ email, name: user.name, image: (user as any).image });
        }
      } catch (e) {
        console.error('Failed to ensure user on signIn', e);
      }
    },
  },
};
