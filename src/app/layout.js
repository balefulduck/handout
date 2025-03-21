import { Jura } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const jura = Jura({
  variable: "--font-jura",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Dr. Cannabis GrowGuide",
  description: "Digitales Pflanzenmonitoring",
  icons: {
    icon: '/drca.svg',
    apple: '/drca.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body className={`${jura.variable} font-jura min-h-screen`} style={{ background: `#f8f8f6` }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
