import { Jura } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const jura = Jura({
  variable: "--font-jura",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Cannabis Anbau Workshop",
  description: "Digitaler Handout für Cannabis Anbau Workshop",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body className={`${jura.variable} font-jura min-h-screen`} style={{ background: `linear-gradient(45deg, #e98b00 0%, #2dabb6 100%)` }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
