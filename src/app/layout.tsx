"use client"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { store } from '../redux/store'
import { Provider } from 'react-redux'
import 'regenerator-runtime/runtime'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <Provider store={store}>
              {children}
        </Provider>
      </body>
    </html>
  );
}
