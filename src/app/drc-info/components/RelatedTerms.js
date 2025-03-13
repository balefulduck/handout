'use client';

import React from 'react';
import Link from 'next/link';

export default function RelatedTerms({ terms }) {
  if (!terms || terms.length === 0) return null;
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 col-span-1 md:col-span-3 mt-4">
      <h3 className="text-lg font-semibold mb-3">Verwandte Begriffe:</h3>
      <div className="flex flex-wrap gap-2">
        {terms.map((term) => (
          <Link 
            key={term}
            href={`/drc-info/${term}`}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
          >
            {term}
          </Link>
        ))}
      </div>
    </div>
  );
}
