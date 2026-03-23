import { Geist, Geist_Mono, Spectral } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "vietnamese"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "vietnamese"],
});

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700", "800"],
});

export const metadata = {
  title: "Gia Phả Dòng Họ Nguyễn Thanh",
  description: "Trang tra cứu thông tin gia phả dòng họ Nguyễn Thanh",
  icons: {
    icon: "/favicon.jpg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spectral.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
