import assert from "node:assert/strict";
import test from "node:test";

import { extractNisFromBarcode, findStudentByBarcode } from "../app/barcode.ts";

const students = [
  { nis: "231001", name: "Alya Regina" },
  { nis: "231002", name: "Malikha Abimanyu" },
];

test("extracts a student NIS from supported barcode payloads", () => {
  assert.equal(extractNisFromBarcode("231001"), "231001");
  assert.equal(extractNisFromBarcode("SIKELAS:231002"), "231002");
  assert.equal(extractNisFromBarcode("NIS-231003-KARTU"), "231003");
  assert.equal(extractNisFromBarcode(" 231004 "), "231004");
});

test("keeps unknown payloads intact for validation feedback", () => {
  assert.equal(extractNisFromBarcode("TIDAK-TERDAFTAR"), "TIDAK-TERDAFTAR");
  assert.equal(extractNisFromBarcode("12345"), "12345");
  assert.equal(extractNisFromBarcode("1234567"), "1234567");
});

test("resolves registered students and rejects unknown barcodes", () => {
  assert.equal(findStudentByBarcode("SIKELAS:231001", students)?.name, "Alya Regina");
  assert.equal(findStudentByBarcode("231002", students)?.name, "Malikha Abimanyu");
  assert.equal(findStudentByBarcode("231999", students), undefined);
  assert.equal(findStudentByBarcode("BARCODE-RUSAK", students), undefined);
});
