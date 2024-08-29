'use client'

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { useEffect } from "react";
import { analytics } from "./firebase";
import { logEvent } from "firebase/analytics";
import { UserProvider } from "./context/UserContext";

const inter = Inter({ subsets: ["latin"] });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  useEffect(() => {
    if (analytics) {
      console.log('Firebase Analytics initialized');
      logEvent(analytics, 'page_view'); // Example of logging a page view event
    }
  }, []);
  return (
    <html lang="en">
      <body className={inter.className}>
      <UserProvider>{children}</UserProvider>
        </body>
    </html>
  );
}
