'use client';

/**
 * Fetches plant diagnostic issues from the database
 * In production, this would query the database
 * For now, we'll use a static dataset for demonstration
 */
export async function getDiagnosticIssues() {
  // This would normally be a database call
  // For Phase 2, we're using a static dataset
  return [
    {
      id: 1,
      symptomId: 'discoloration',
      category: 'leaves',
      title: 'Stickstoffmangel',
      description: 'Die gelbe Verfärbung der unteren Blätter deutet auf einen Stickstoffmangel hin.',
      criteria: {
        location: 'lower',
        color: 'yellow'
      },
      causes: [
        'Unzureichende Nährstoffversorgung',
        'Falsche pH-Werte im Substrat (beeinträchtigt die Nährstoffaufnahme)',
        'Überreife Pflanze (natürlicher Prozess gegen Ende der Blüte)'
      ],
      solutions: [
        'Erhöhe die Stickstoffzufuhr mit geeignetem Dünger',
        'Kontrolliere den pH-Wert des Substrats (optimal: 6.0-6.5 in Erde, 5.5-6.0 in Hydro)',
        'Stelle sicher, dass die Bewässerung regelmäßig erfolgt'
      ],
      severity: 'medium',
      needsExpertHelp: false,
      images: ['/images/diagnose/nitrogen-deficiency.jpg']
    },
    {
      id: 2,
      symptomId: 'discoloration',
      category: 'leaves',
      title: 'Phosphormangel',
      description: 'Braune/lila Verfärbungen deuten auf Phosphormangel hin.',
      criteria: {
        location: 'lower',
        color: 'brown'
      },
      causes: [
        'Unzureichende Phosphorversorgung',
        'Zu niedrige Temperatur (behindert die Phosphoraufnahme)',
        'pH-Wert außerhalb des optimalen Bereichs'
      ],
      solutions: [
        'Verwende einen phosphorreichen Dünger',
        'Erhöhe die Wurzeltemperatur auf mindestens 18°C',
        'Passe den pH-Wert an (6.0-6.5 in Erde)'
      ],
      severity: 'medium',
      needsExpertHelp: false,
      images: ['/images/diagnose/phosphorus-deficiency.jpg']
    },
    // Additional diagnostic issues would be added here
  ];
}

/**
 * Future implementation would include database functions like:
 * - addDiagnosticIssue
 * - updateDiagnosticIssue
 * - deleteDiagnosticIssue
 * - uploadReferenceImage
 */
