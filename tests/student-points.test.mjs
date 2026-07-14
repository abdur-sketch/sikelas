import assert from "node:assert/strict";
import test from "node:test";

import { getDevelopmentPredicate, normalizeDevelopmentPoints, summarizeStudentPoints } from "../app/student-points.ts";

const records = [
  { id: "1", nis: "231001", type: "Portofolio", title: "Karya", detail: "", date: "2026-07-01", points: 15 },
  { id: "2", nis: "231001", type: "Prestasi", title: "Juara", detail: "", date: "2026-07-02", points: 50 },
  { id: "3", nis: "231001", type: "Pelanggaran", title: "Terlambat", detail: "", date: "2026-07-03", points: -10 },
];

test("normalizes positive and violation points", () => {
  assert.equal(normalizeDevelopmentPoints("Prestasi", -25), 25);
  assert.equal(normalizeDevelopmentPoints("Portofolio", 10.4), 10);
  assert.equal(normalizeDevelopmentPoints("Pelanggaran", 15), -15);
});

test("accumulates portfolio, achievement, and violation points", () => {
  const summary = summarizeStudentPoints("231001", records);
  assert.equal(summary.portfolioCount, 1);
  assert.equal(summary.portfolioPoints, 15);
  assert.equal(summary.achievementPoints, 50);
  assert.equal(summary.violationPoints, 10);
  assert.equal(summary.totalPoints, 55);
});

test("assigns semester predicates from accumulated points", () => {
  assert.equal(getDevelopmentPredicate(85), "Sangat Baik");
  assert.equal(getDevelopmentPredicate(55), "Baik");
  assert.equal(getDevelopmentPredicate(25), "Cukup");
  assert.equal(getDevelopmentPredicate(5), "Perlu Pembinaan");
});
