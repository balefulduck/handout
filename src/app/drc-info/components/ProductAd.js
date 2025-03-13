'use client';

import React from 'react';
import Image from 'next/image';
import { FaShoppingCart } from 'react-icons/fa';

export default function ProductAd({ product }) {
  if (!product) return null;
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 col-span-1 md:col-span-3 relative overflow-hidden">
      <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg transform rotate-3 text-sm font-bold z-10">
        -10 % für Dich als Dr. Cannabis Workshop Besucher
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="md:w-1/4 flex-shrink-0">
          <Image 
            src={product.image} 
            width={250} 
            height={250} 
            alt={product.name}
            className="rounded-lg" 
          />
        </div>
        <div className="md:w-3/4">
          <h3 className="text-xl font-bold mb-2">{product.name}</h3>
          <p className="text-gray-600 mb-3">{product.description}</p>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-gray-400 line-through">{product.regularPrice}</span>
            <span className="text-xl font-bold text-green-600">{product.salePrice}</span>
          </div>
          <button className="px-4 py-2 bg-olive-green text-white rounded-lg hover:bg-olive-green/90 transition-colors flex items-center gap-2">
            <FaShoppingCart size={14} />
            <span>In den Warenkorb</span>
          </button>
        </div>
      </div>
    </div>
  );
}
