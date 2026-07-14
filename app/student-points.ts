export type DevelopmentType = "Portofolio" | "Prestasi" | "Pelanggaran";
export type DevelopmentRecord = { id: string; nis: string; type: DevelopmentType; title: string; detail: string; date: string; points: number };

export function normalizeDevelopmentPoints(type: DevelopmentType, points: number): number {
  const value = Math.abs(Math.round(points));
  return type === "Pelanggaran" ? -value : value;
}

export function summarizeStudentPoints(nis: string, records: readonly DevelopmentRecord[]) {
  const owned = records.filter((record) => record.nis === nis);
  return {
    records: owned,
    portfolioCount: owned.filter((record) => record.type === "Portofolio").length,
    portfolioPoints: owned.filter((record) => record.type === "Portofolio").reduce((sum, record) => sum + record.points, 0),
    achievementPoints: owned.filter((record) => record.type === "Prestasi").reduce((sum, record) => sum + record.points, 0),
    violationPoints: Math.abs(owned.filter((record) => record.type === "Pelanggaran").reduce((sum, record) => sum + record.points, 0)),
    totalPoints: owned.reduce((sum, record) => sum + record.points, 0),
  };
}

export function getDevelopmentPredicate(total: number): string {
  if (total >= 80) return "Sangat Baik";
  if (total >= 50) return "Baik";
  if (total >= 20) return "Cukup";
  return "Perlu Pembinaan";
}
