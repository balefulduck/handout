import React from 'react';
import ContextMenu from '@/components/ContextMenu';

export default function Rechtliches() {
  return (
    <>
      <ContextMenu />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Rechtlicher Hinweis</h1>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Rechtlicher Status von Cannabis in Deutschland</h2>
          <p className="mb-4">
            Die Informationen in dieser Anwendung dienen ausschließlich Bildungs- und Informationszwecken. 
            Der Anbau, Besitz und Konsum von Cannabis in Deutschland unterliegt gesetzlichen Regelungen, 
            die sich im Wandel befinden.
          </p>
          
          <p className="mb-4">
            <strong>Aktuelle rechtliche Situation:</strong>
          </p>
          
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              Seit dem 1. April 2024 ist der Besitz bestimmter Mengen Cannabis für Erwachsene ab 18 Jahren 
              unter bestimmten Bedingungen erlaubt. Dies umfasst den Eigenanbau in begrenztem Umfang sowie 
              den Besitz definierter Mengen für den Eigenkonsum.
            </li>
            <li>
              Der Anbau von Cannabis zu medizinischen Zwecken unterliegt weiterhin strengen Regulierungen 
              und erfordert entsprechende Genehmigungen.
            </li>
            <li>
              Der kommerzielle Anbau und Verkauf von Cannabis bleibt weiterhin reguliert und ist nur unter 
              bestimmten Bedingungen und mit entsprechenden Genehmigungen erlaubt.
            </li>
          </ul>
          
          <p className="mb-4">
            <strong>Haftungsausschluss:</strong>
          </p>
          
          <p className="mb-4">
            Die in dieser Anwendung bereitgestellten Informationen zum Anbau von Cannabis dienen ausschließlich 
            Bildungszwecken und der Information über gute Anbaupraxis. Die Dr. Cannabis Akademie GmbH übernimmt 
            keine Haftung für die Nutzung dieser Informationen in einer Weise, die gegen geltendes Recht verstößt.
          </p>
          
          <p className="mb-4">
            Nutzer dieser Anwendung sind selbst dafür verantwortlich, sich über die aktuell geltenden Gesetze 
            und Vorschriften zu informieren und diese einzuhalten. Wir empfehlen, sich bei rechtlichen Fragen 
            an qualifizierte Rechtsberater zu wenden.
          </p>
          
          <p className="mb-4">
            Die Nutzung dieser Anwendung entbindet nicht von der Pflicht, sich an alle geltenden Gesetze und 
            Vorschriften zu halten.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Medizinische Hinweise</h2>
          <p className="mb-4">
            Die in dieser Anwendung bereitgestellten Informationen ersetzen keine professionelle medizinische 
            Beratung, Diagnose oder Behandlung. Bei gesundheitlichen Fragen oder Problemen wenden Sie sich bitte 
            an qualifizierte Ärzte oder medizinisches Fachpersonal.
          </p>
        </section>
      </div>
    </>
  );
}
