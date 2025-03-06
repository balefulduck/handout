import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-custom-orange text-white rounded-xl shadow-lg p-8 max-w-2xl w-full text-center">
        <div className="mb-8">
          <Image
            src="/drca.svg"
            alt="DRCA Logo"
            width={120}
            height={120}
            className="mx-auto"
            priority
          />
        </div>
        
        <h1 className="text-4xl font-bold font-aptos mb-2">
          Willkommen beim Grow-Workshop
        </h1>
        <p className="text-3xl font-light text-white/90">
          Basic
        </p>
        <div className="mt-8">
          <Link 
            href="/login" 
            className="inline-block px-6 py-3 text-lg font-semibold bg-white text-custom-orange rounded-lg hover:bg-white/90 transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Tippe hier um zu beginnen
          </Link>
        </div>
     
      </div>

    </main>
  );
}
