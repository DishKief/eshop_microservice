import Header from "../shared/widgets";
import "./global.css";
import { Poppins, Roboto, Oregano } from "next/font/google";
import Providers from "./providers";

export const metadata = {
  title: "Welcome to Eshop",
  description:
    "Eshop is a modern e-commerce platform built with Next.js and Tailwind CSS. It offers a seamless shopping experience with a wide range of products, secure payment options, and fast delivery. Explore our collection and enjoy hassle-free online shopping.",
};

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const oregano = Oregano({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-oregano",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} ${poppins.variable} ${oregano.variable}`}
      >
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
