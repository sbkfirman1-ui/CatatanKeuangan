import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import IntroScreen from "@/components/IntroScreen";

import { UserProvider } from "@/context/UserContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CatatanKeuangan",
  description: "Financial Notes App",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-secondary h-screen flex overflow-hidden`}>
        <UserProvider>
          <IntroScreen />
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 pt-20 md:p-8">
            <div className="max-w-7xl mx-auto min-h-full pb-24 md:pb-0">
              {children}
            </div>
          </main>
        </UserProvider>
      </body>
    </html>
  );
}
