import NextAuth from "next-auth";
import { authOptions } from "@/auth";

// Ensure this runs in the Node.js runtime (not Edge)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
