// Stub validators for the static demo — accept everything.

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImage(): ValidationResult {
  return { valid: true };
}

export function validateImageFile(): ValidationResult {
  return { valid: true };
}

export function validateImageDimensions(): ValidationResult {
  return { valid: true };
}
