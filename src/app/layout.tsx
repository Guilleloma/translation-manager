import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ChakraProviderWrapper } from "../components/ChakraProviderClient";
import Header from "../components/layout/Header";
import SeedDataLoader from "../components/SeedDataLoader";
import LoadingIndicator from "../components/layout/LoadingIndicator";
import { Box } from "@chakra-ui/react";

// Importar utilidad de debug solo en desarrollo
if (process.env.NODE_ENV === 'development') {
  import('../utils/debugStorage');
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Translation Manager",
  description: "Herramienta para gestionar traducciones",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      {/* suppressHydrationWarning prevents errors from browser extensions that modify the DOM */}
      <body 
        className={`${geistSans.variable} ${geistMono.variable}`} 
        suppressHydrationWarning 
      >
        <ChakraProviderWrapper>
          <SeedDataLoader />
          <LoadingIndicator />
          <Header />
          <Box as="main" minH="calc(100vh - 64px)">
            {children}
          </Box>
        </ChakraProviderWrapper>
      </body>
    </html>
  );
}
