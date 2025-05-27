export function getPrompt(language: string, specialty: string) {
  return `Act as a senior ${specialty} engineer. Analyze this ${language} code for ${specialty.toLowerCase()} issues.
Format response as:

1. Brief summary (1 sentence)
2. Key findings (bulleted list)
3. Most critical recommendation

Avoid markdown. Be technical but concise.`;
}