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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata = {
  title: "Nguyễn Thanh Tộc - Gia Phả Trực Tuyến",
  description: "Trang tra cứu thông tin gia phả và kết nối dòng họ Nguyễn Thanh. Hệ thống lưu trữ và tra cứu thông tin qua các thế hệ.",
  openGraph: {
    title: "Gia Phả Nguyễn Thanh Tộc",
    description: "Khám phá cội nguồn và tra cứu thông tin gia phả dòng họ qua các đời. Hệ thống lưu trữ gia phả trực tuyến hiện đại.",
    images: [
      {
        url: "/icon.jpg",
        width: 512,
        height: 512,
        alt: "Gia Phả Nguyễn Thanh Tộc",
      },
    ],
    locale: "vi_VN",
    type: "website",
    siteName: "Gia Phả Nguyễn Thanh Tộc",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gia Phả Nguyễn Thanh Tộc",
    description: "Hệ thống lưu trữ và tra cứu gia phả trực tuyến qua các thế hệ.",
    images: ["/icon.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spectral.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
