'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { useEffect } from "react";
import { analytics } from "./firebase";
import { logEvent } from "firebase/analytics";
import { UserProvider } from "./context/UserContext";
import { usePathname } from 'next/navigation';
import Navbar from "./components/Navbar"; 

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const pathname = usePathname(); // Get the current path

  useEffect(() => {
    if (analytics) {
      console.log('Firebase Analytics initialized');
      logEvent(analytics, 'page_view'); // Example of logging a page view event
    }
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        {(pathname !== '/' && pathname !== '/login') ? (
          <>
            <Navbar /> {/* Conditionally render the Navbar */}
            <UserProvider>{children}</UserProvider>
          </>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
