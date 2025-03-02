'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/24/solid';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedStrains, setSelectedStrains] = useState([]);

  useEffect(() => {
    const fetchStrains = async () => {
      const response = await fetch('/api/strains/selected');
      if (response.ok) {
        const data = await response.json();
        setSelectedStrains(data.strains);
      }
    };
    fetchStrains();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Disclosure defaultOpen={true}>
        {({ open }) => (
          <>
            <div className="sticky top-0 z-10 bg-white shadow-md">
              <Disclosure.Button className="flex w-full justify-between items-center px-4 py-2 text-left focus:outline-none focus-visible:ring focus-visible:ring-opacity-75">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm text-gray-600">Willkommen zurück,</p>
                    <p className="font-medium">{session?.user?.name || 'Workshop'}</p>
                  </div>
                </div>
                <ChevronUpIcon
                  className={`${open ? 'transform rotate-180' : ''} w-5 h-5 text-gray-500 transition-transform duration-200`}
                />
              </Disclosure.Button>

              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel className="px-4 pb-4">
                  <div className="mt-4">
                    <h2 className="text-2xl font-semibold mb-4">Deine ausgewählten Sorten</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedStrains.map((strain) => (
                        <div key={strain.id} className="bg-gray-50 rounded-lg p-4">
                          <h3 className="font-semibold">{strain.name}</h3>
                          <p className="text-sm text-gray-600">{strain.type}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Disclosure.Panel>
              </Transition>
            </div>
          </>
        )}
      </Disclosure>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Growth Phases */}
         {/* Seedling phase */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div onClick={() => router.push('/phases/seedling')} className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-teal hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">Keimlingsphase</h2>
          </div>

           {/* Vegetation Phase */}
          <div onClick={() => router.push('/phases/vegetation')} className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-lime hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">Vegetatives Wachstum</h2>
          </div>
          
           {/* FLower Phase */}
          <div onClick={() => router.push('/phases/flower')} className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">Blütephase</h2>
          </div>

             {/* Harvest */}
          <div onClick={() => router.push('/phases/harvest')} className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">Ernte</h2>
          </div>
        </div>

        {/* Emergency Help Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition-shadow">
          <h2 className="text-2xl font-semibold text-red-500 mb-4">Notfall-Hilfe</h2>
          <p className="text-gray-600">Schnelle Hilfe bei Problemen mit deinen Pflanzen</p>
          <button className="mt-4 text-red-500 hover:text-red-700">Hilfe bekommen →</button>
        </div>
      </main>
    </div>
  );
}
