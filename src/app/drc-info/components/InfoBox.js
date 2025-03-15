'use client';

import React from 'react';

export default function InfoBox({ title, children, colSpan = "col-span-1" }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 ${colSpan}`}>
      {title && <h2 className="text-xl font-semibold mb-3">{title}</h2>}
      {children}
    </div>
  );
}
