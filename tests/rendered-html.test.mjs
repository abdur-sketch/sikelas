import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the SIKELAS dashboard", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>SIKELAS Nurul Iman<\/title>/i);
  assert.match(html, /Assalamu.alaikum, Ust\. Abdurohman Yusuf!/i);
  assert.match(html, /Jadwal Pelajaran/i);
  assert.match(html, /Absensi Hari Ini/i);
  assert.match(html, /X DKV 1/i);
  assert.match(html, /XI DKV 1/i);
  assert.match(html, /XII DKV 1/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("keeps product metadata and removes starter dependencies", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /title:\s*"SIKELAS Nurul Iman"/);
  assert.match(layout, /lang="id"/);
  assert.match(page, /Data Siswa/);
  assert.match(page, /Absensi Harian/);
  assert.match(page, /Tugas & Nilai/);
  assert.match(page, /const classOptions/);
  assert.match(page, /setActiveClass/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.doesNotMatch(page + layout, /codex-preview|_sites-preview|SkeletonPreview/);
});
