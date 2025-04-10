import React from 'react';
import ContextMenu from '@/components/ContextMenu';

export default function Impressum() {
  return (
    <>
      <ContextMenu />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Impressum</h1>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Angaben gemäß § 5 TMG</h2>
          <p>Dr. Cannabis Akademie GmbH<br />
          Auf Jungs Wies 35-37<br />
          66265 Heusweiler</p>
          
          <p className="mt-4">Handelsregister: HRB 109084<br />
          Registergericht: Amtsgericht Saarbrücken</p>
          
          <p className="mt-4"><strong>Vertreten durch:</strong><br />
          Prof. Dr. Sven Gottschling & Jörg Hell</p>
          
          <p className="mt-2"><strong>Verantwortlicher:</strong><br />
          Jörg Hell</p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Kontakt</h2>
          <p>Telefon: + (49) 6806 9513426<br />
          Telefax: + (49) 6806 9513429<br />
          E-Mail: info@drcannabis-akademie.de</p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Umsatzsteuer-ID</h2>
          <p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
          DE359587048</p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">EU-Streitschlichtung</h2>
          <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr/" className="text-olive-green hover:underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a>.<br />
          Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Verbraucher­streit­beilegung/Universal­schlichtungs­stelle</h2>
          <p>Wir nehmen an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teil. Zuständig ist die Universalschlichtungsstelle des Zentrums für Schlichtung e.V., Straßburger Straße 8, 77694 Kehl am Rhein (<a href="https://www.verbraucher-schlichter.de" className="text-olive-green hover:underline" target="_blank" rel="noopener noreferrer">https://www.verbraucher-schlichter.de</a>).</p>
        </section>
        
        <section className="mb-6">
          <p className="text-sm text-gray-600">Quelle: e-recht24.de</p>
          <p className="text-sm text-gray-600">Alternative Streitbeilegung gemäß Art. 14 Abs. 1 ODR-VO und § 36 VSBG:</p>
          <p className="text-sm text-gray-600">Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, die du unter <a href="https://ec.europa.eu/consumers/odr" className="text-olive-green hover:underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a> findest. Zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle sind wir nicht verpflichtet und nicht bereit.</p>
        </section>
      </div>
    </>
  );
}
