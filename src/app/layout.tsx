import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
});

export const metadata: Metadata = {
  title: "SOLANA SNAKE - Retro Crypto Game",
  description: "A retro snake game where your Solana wallet tokens become snakes that grow and shrink based on real-time price movements.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pressStart.variable} bg-black`}>
        {children}
      </body>
    </html>
  );
}
