export function extractNisFromBarcode(rawCode: string): string {
  const normalizedCode = rawCode.trim();
  return normalizedCode.match(/(?:^|\D)(\d{6})(?:\D|$)/)?.[1] ?? normalizedCode;
}

export function findStudentByBarcode<T extends { nis: string }>(rawCode: string, students: readonly T[]): T | undefined {
  const nis = extractNisFromBarcode(rawCode);
  return students.find((student) => student.nis === nis);
}
