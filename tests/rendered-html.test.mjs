import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("build emits the SIKELAS dashboard and persistent API route", async () => {
  const [page, layout, worker] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../dist/server/index.js", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /SIKELAS Nurul Iman/i);
  assert.match(page, /Assalamu.alaikum, Ust\. Abdurohman Yusuf!/i);
  assert.match(page, /Jadwal Pelajaran/i);
  assert.match(page, /Absensi Hari Ini/i);
  assert.match(page, /Rekam Jejak/i);
  assert.match(worker, /api\/development-records/i);
  assert.match(worker, /api\/sikelas/i);
  assert.match(worker, /CREATE TABLE IF NOT EXISTS development_records/i);
  assert.match(worker, /CREATE TABLE IF NOT EXISTS attendance_records/i);
  assert.match(worker, /CREATE TABLE IF NOT EXISTS audit_logs/i);
  assert.doesNotMatch(page + layout, /codex-preview|Your site is taking shape/i);
});

test("keeps product metadata and removes starter dependencies", async () => {
  const [page, layout, packageJson, hosting, schema, runtime, api, uploadApi, fileApi] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../db/runtime.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/sikelas/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/portfolio-upload/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/portfolio-file/route.ts", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /title:\s*"SIKELAS Nurul Iman"/);
  assert.match(layout, /lang="id"/);
  assert.match(page, /Data Siswa/);
  assert.match(page, /Absensi Harian/);
  assert.match(page, /Tugas & Nilai/);
  assert.match(page, /const classOptions/);
  assert.match(page, /setActiveClass/);
  assert.match(page, /function AnnouncementsPage/);
  assert.match(page, /function PortfolioPage/);
  assert.match(page, /function SettingsPage/);
  assert.match(page, /function StudentDevelopmentPage/);
  assert.match(page, /Laporan Semester/);
  assert.match(page, /Poin Pelanggaran/);
  assert.match(page, /profile-popover/);
  assert.match(page, /sidebar-profile-menu/);
  assert.match(page, /sidebarProfileOpen/);
  assert.match(page, /Keluar dari akun/);
  assert.match(page, /Pengaturan akun/);
  assert.match(page, /api\/development-records/);
  assert.match(hosting, /"d1":\s*"DB"/);
  assert.match(hosting, /"r2":\s*"FILES"/);
  assert.match(schema, /development_records/);
  assert.match(schema, /attendance_records/);
  assert.match(schema, /audit_logs/);
  assert.match(schema, /schedules/);
  assert.match(schema, /grades/);
  assert.match(schema, /settings/);
  assert.match(runtime, /oai-authenticated-user-email/);
  assert.match(runtime, /requireWriteRole/);
  assert.match(api, /Barcode tidak sah/);
  assert.match(api, /notificationRead/);
  assert.match(api, /barcodeRegenerate/);
  assert.match(api, /todayJakarta/);
  assert.doesNotMatch(api, /date=\?[^\n]*2026-07-15/);
  assert.match(uploadApi, /10 \* 1024 \* 1024/);
  assert.match(uploadApi, /getR2/);
  assert.match(fileApi, /x-content-type-options/);
  assert.match(page, /function BarcodeScanner/);
  assert.match(page, /BrowserMultiFormatReader/);
  assert.match(page, /Scan Barcode/);
  assert.match(page, /Catat Kehadiran/);
  assert.match(page, /Seleksi Lomba Kreativitas Siswa/);
  assert.match(page, /Rebranding Kopi Gunung/);
  assert.match(page, /Bobot Penilaian/);
  assert.match(page, /Aturan Poin & Riwayat Perubahan/);
  assert.match(page, /Unduh Kartu Barcode/);
  assert.match(page, /Unduh Rekap/);
  assert.match(page, /Regenerasi Barcode/);
  assert.match(page, /Tambah Jadwal/);
  assert.match(page, /Tambah Tugas/);
  assert.match(page, /Berkas bukti/);
  assert.match(page, /signout-with-chatgpt/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.doesNotMatch(page + layout, /codex-preview|_sites-preview|SkeletonPreview/);
});
