export function validateMatricNumber(matric: string) {
  if (!matric.trim()) {
    return {
      valid: false,
      error: "Matric number is required",
    };
  }

  return { valid: true };
}