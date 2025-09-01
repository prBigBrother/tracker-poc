import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import UserMenu from "@/components/UserMenu";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  const user = session.user;
  const initial = (user?.name || user?.email || "?").slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold">LT</div>
              <span className="text-base sm:text-lg font-semibold text-gray-900">Location Tracker</span>
            </div>
            <UserMenu user={{ name: user?.name, email: user?.email, image: user?.image }} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}
