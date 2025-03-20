'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export default function PageHeader({ title, icon }) {
  return (
    <header className="bg-olive-green text-white p-4 shadow-md">
      <div className="container mx-auto max-w-5xl">
        <Link href="/growguide" className="flex items-center gap-2 w-fit text-white hover:text-yellow-50 transition-colors">
          <FaArrowLeft />
          <span>Zurück zum Grow Guide</span>
        </Link>
        <div className="flex items-center gap-3 mt-4">
          <Image 
            src={icon || '/1.webp'} 
            width={50} 
            height={50} 
            alt={title}
            className="rounded-full border-2 border-white" 
          />
          <h1 className="text-2xl font-bold">Dr. Cannabis Lexikon: {title}</h1>
        </div>
      </div>
    </header>
  );
}
