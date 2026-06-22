export async function getWorkoutSuggestion(prompt: string): Promise<string> {
  const response = await fetch('/api/claude', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      system:
        'Du bist ein professioneller Fitness-Trainer. Erstelle kurze, klare Trainingspläne auf Deutsch. Antworte strukturiert mit Übungsname, Sets, Wiederholungen und Gewichtsempfehlung.',
    }),
  });

  const data = await response.json();
  return data.content?.[0]?.text ?? 'Keine Antwort erhalten.';
}

