import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-olive-green text-white py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">© {new Date().getFullYear()} Dr. Cannabis Akademie GmbH</p>
          </div>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
            <Link href="/impressum" className="text-sm hover:underline">
              Impressum
            </Link>
            <Link href="/datenschutz" className="text-sm hover:underline">
              Datenschutz
            </Link>
            <Link href="/rechtliches" className="text-sm hover:underline">
              Rechtlicher Hinweis
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
