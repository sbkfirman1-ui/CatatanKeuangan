import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import IntroScreen from "@/components/IntroScreen";
import TransactionModal from "@/components/TransactionModal";

import { UserProvider } from "@/context/UserContext";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#705994",
  colorScheme: "light dark",
};

export const metadata: Metadata = {
  title: "CatatanKeuangan",
  description: "Financial Notes App",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#705994" />
        <meta name="msapplication-navbutton-color" content="#705994" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.className} bg-background text-secondary h-screen flex overflow-hidden`}>
        <UserProvider>
          <IntroScreen />
          <TransactionModal />
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
