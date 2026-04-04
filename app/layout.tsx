import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thiệp cưới Diễm My & Công Tú 💍 21.04.2026",
  description: "Trân trọng kính mời bạn đến dự lễ thành hôn của Diễm My & Công Tú vào ngày 21 tháng 04 năm 2026. 💕",
  robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  openGraph: {
    title: "Thiệp cưới Diễm My & Công Tú 💍 21.04.2026",
    description: "Trân trọng kính mời bạn đến dự lễ thành hôn của Diễm My & Công Tú vào ngày 21 tháng 04 năm 2026. 💕",
    type: "website",
    images: [
      {
        url: "https://wedding-bride-three.vercel.app/assets/images/4011796024475880260.webp",
        width: 1200,
        height: 630,
        alt: "Thiệp cưới Diễm My & Công Tú 💍 21.04.2026",
      },
    ],
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Thiệp cưới Diễm My & Công Tú 💍 21.04.2026",
    description: "Trân trọng kính mời bạn đến dự lễ thành hôn của Diễm My & Công Tú vào ngày 21 tháng 04 năm 2026. 💕",
    images: ["https://wedding-bride-three.vercel.app/assets/images/4011796024475880260.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="mdl-js">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="/assets/images/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/favicon.ico" />
        <link rel="stylesheet" href="/534d19d963ca7a9d.css" />
        <link rel="stylesheet" href="/3a12fbab90cd8589.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
