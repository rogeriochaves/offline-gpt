import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.scss";
import { ChakraProvider } from "@chakra-ui/react";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Offline GPT",
  description: "Chat with LLMs offline directly in your browser",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>{children}</ChakraProvider>
      </body>
      <GoogleAnalytics gaId="G-4ES4SE7DHZ" />
    </html>
  );
}
