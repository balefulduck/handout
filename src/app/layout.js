import { Jura } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";

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
      <body className={`${jura.variable} font-jura min-h-screen flex flex-col`} style={{ background: `#f8f8f6` }}>
        <Providers>
          <div className="flex-grow">{children}</div>
          <Footer />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
