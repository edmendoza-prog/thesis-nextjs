import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Nunito, Titan_One } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

const titanOne = Titan_One({
  weight: "400",
  variable: "--font-titan",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Go Learning - Digital Learning & Classroom Management",
  description: "A modern, professional learning management platform for students and educators.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} ${nunito.variable} ${titanOne.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">{children}</body>
    </html>
  );
}
