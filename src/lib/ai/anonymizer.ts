/**
 * Simple PHI (Protected Health Information) Anonymizer
 * This is a basic implementation for demonstration. 
 * In production, use a more robust library or a dedicated NLP model.
 */
export function anonymizeText(text: string): string {
  let anonymized = text;

  // Patterns for common PHI
  const patterns = [
    { regex: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[SSN_REDACTED]' }, // SSN
    { regex: /\b\d{10,12}\b/g, replacement: '[PHONE_REDACTED]' }, // Phone numbers (simple)
    { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '[EMAIL_REDACTED]' }, // Email
    { regex: /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, replacement: '[DATE_REDACTED]' }, // Dates
    { regex: /\b(Patient Name|Name:)\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b/gi, replacement: '$1 [NAME_REDACTED]' }, // Names
  ];

  patterns.forEach(({ regex, replacement }) => {
    anonymized = anonymized.replace(regex, replacement);
  });

  return anonymized;
}
