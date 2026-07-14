"use client";

import { useMemo, useState } from "react";

type PageKey = "dashboard" | "siswa" | "absensi" | "jadwal" | "tugas" | "pengumuman" | "portofolio" | "pengaturan";
type Attendance = "Hadir" | "Sakit" | "Izin" | "Alpa" | "Terlambat";

const classOptions = [
  { label: "X DKV 1", short: "X", students: 30, boys: 17, girls: 13, present: 28 },
  { label: "XI DKV 1", short: "XI", students: 32, boys: 18, girls: 14, present: 29 },
  { label: "XII DKV 1", short: "XII", students: 28, boys: 16, girls: 12, present: 27 },
] as const;

const students = [
  { name: "Alya Regina", nis: "231001", class: "XI DKV 1", gender: "p", guardian: "0812 3456 7890", status: "Aktif", initials: "AF", color: "mint" },
  { name: "Malikha Abimanyu", nis: "231002", class: "XI DKV 1", gender: "P", guardian: "0857 1122 3344", status: "Aktif", initials: "AP", color: "peach" },
  { name: "Rista Ayu Dewi", nis: "231003", class: "XI DKV 1", gender: "p", guardian: "0813 9087 6543", status: "Aktif", initials: "BM", color: "blue" },
  { name: "Sinar Lorenza", nis: "231004", class: "XI DKV 1", gender: "P", guardian: "0821 4455 6677", status: "Aktif", initials: "CL", color: "lilac" },
  { name: "Zahra Khairunnisa", nis: "231005", class: "XI DKV 1", gender: "p", guardian: "0895 7788 9900", status: "Aktif", initials: "DP", color: "yellow" },
  { name: "Jilan Afifah", nis: "231006", class: "XI DKV 1", gender: "P", guardian: "0819 2233 4455", status: "Aktif", initials: "FN", color: "pink" },
];

const schedule = [
  { time: "07.00 – 08.30", subject: "Desain Grafis", teacher: "Ust. Abdurohman Yusuf.", room: "Lab DKV", tone: "green" },
  { time: "08.30 – 10.00", subject: "Fotografi", teacher: "Bapak Riki Ardian Pratama", room: "Studio Foto", tone: "gold" },
  { time: "10.15 – 11.45", subject: "Bahasa Indonesia", teacher: "Ustzh. Intan Inayah, S.Pd.", room: "Ruang XI DKV 1", tone: "blue" },
  { time: "12.45 – 14.15", subject: "Bahasa Inggris", teacher: "Ustzh. Miftah Nurul hikmah, S.Pd.", room: "Kelas", tone: "purple" },
];

const tasks = [
  { title: "Poster Hari Kemerdekaan", subject: "Desain Grafis", due: "16 Jul 2026", submitted: 28, total: 32, status: "Berjalan", tone: "green" },
  { title: "Foto Produk Lokal", subject: "Fotografi", due: "18 Jul 2026", submitted: 21, total: 32, status: "Berjalan", tone: "gold" },
  { title: "Esai Budaya Pesantren", subject: "Bahasa Indonesia", due: "20 Jul 2026", submitted: 12, total: 32, status: "Baru", tone: "blue" },
  { title: "Animasi Logo Sekolah", subject: "Animasi Dasar", due: "11 Jul 2026", submitted: 31, total: 32, status: "Selesai", tone: "purple" },
];

const announcements = [
  { title: "Seleksi Lomba Kreativitas Siswa", category: "Kegiatan", audience: "Semua Kelas", date: "17 Jul 2026", author: "Ust. Abdurohman Yusuf", priority: "Penting", status: "Terbit", excerpt: "Setiap siswa DKV diminta membawa satu karya terbaik untuk proses kurasi di Lab DKV." },
  { title: "Jadwal Penilaian Tengah Semester", category: "Akademik", audience: "Semua Kelas", date: "20 Jul 2026", author: "Wakasek Kurikulum", priority: "Penting", status: "Terjadwal", excerpt: "PTS semester ganjil dilaksanakan mulai 3 Agustus. Kisi-kisi tersedia melalui guru mata pelajaran." },
  { title: "Perlengkapan Praktik Fotografi", category: "Perlengkapan", audience: "XI DKV 1", date: "15 Jul 2026", author: "Riki Ardian Pratama", priority: "Normal", status: "Terbit", excerpt: "Siswa membawa kamera atau ponsel, kain latar polos, serta produk lokal untuk sesi foto studio." },
  { title: "Kegiatan Muhadharah Pesantren", category: "Pesantren", audience: "X DKV 1", date: "18 Jul 2026", author: "Pembina Pesantren", priority: "Normal", status: "Terbit", excerpt: "Muhadharah pekanan dilaksanakan selepas Isya. Petugas diminta hadir 30 menit lebih awal." },
  { title: "Pengumpulan Berkas PKL", category: "Administrasi", audience: "XII DKV 1", date: "24 Jul 2026", author: "Koordinator PKL", priority: "Penting", status: "Draf", excerpt: "Lengkapi surat persetujuan wali, biodata, dan pilihan tempat PKL sebelum batas pengumpulan." },
];

const portfolioItems = [
  { title: "Rebranding Kopi Gunung", type: "Desain Grafis", student: "Alya Regina", className: "XI DKV 1", date: "12 Jul 2026", status: "Terpilih", score: 92, tone: "teal" },
  { title: "Cerita Pagi di Pesantren", type: "Fotografi", student: "Malikha Abimanyu", className: "XI DKV 1", date: "9 Jul 2026", status: "Dipublikasi", score: 89, tone: "blue" },
  { title: "Animasi Logo Nurul Iman", type: "Animasi", student: "Rista Ayu Dewi", className: "XI DKV 1", date: "5 Jul 2026", status: "Ditinjau", score: 87, tone: "purple" },
  { title: "Poster Adab Menuntut Ilmu", type: "Desain Grafis", student: "Fahri Ramadhan", className: "X DKV 1", date: "10 Jul 2026", status: "Dipublikasi", score: 86, tone: "orange" },
  { title: "Video Profil Perpustakaan", type: "Video", student: "Nadia Safitri", className: "X DKV 1", date: "7 Jul 2026", status: "Ditinjau", score: 84, tone: "blue" },
  { title: "Website Katalog Karya DKV", type: "Website", student: "Rizky Maulana", className: "XII DKV 1", date: "11 Jul 2026", status: "Terpilih", score: 94, tone: "teal" },
  { title: "Film Pendek Jejak Santri", type: "Video", student: "Salsa Nabila", className: "XII DKV 1", date: "6 Jul 2026", status: "Dipublikasi", score: 91, tone: "purple" },
];

const navItems: { key: PageKey; label: string; icon: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "⌂" },
  { key: "siswa", label: "Data Siswa", icon: "♙" },
  { key: "absensi", label: "Absensi", icon: "✓" },
  { key: "jadwal", label: "Jadwal Pelajaran", icon: "□" },
  { key: "tugas", label: "Tugas & Nilai", icon: "✎" },
];

const secondaryNavItems: { key: PageKey; label: string; icon: string }[] = [
  { key: "pengumuman", label: "Pengumuman", icon: "☏" },
  { key: "portofolio", label: "Portofolio", icon: "◇" },
  { key: "pengaturan", label: "Pengaturan", icon: "⚙" },
];

const pageMeta: Record<PageKey, { eyebrow: string; title: string; subtitle: string }> = {
  dashboard: { eyebrow: "Selasa, 14 Juli 2026", title: "Assalamu’alaikum, Ust. Abdurohman Yusuf!", subtitle: "Berikut ringkasan kegiatan kelas XI DKV 1 hari ini." },
  siswa: { eyebrow: "Manajemen kelas", title: "Data Siswa", subtitle: "Kelola identitas dan status siswa XI DKV 1." },
  absensi: { eyebrow: "Selasa, 14 Juli 2026", title: "Absensi Harian", subtitle: "Catat kehadiran siswa dengan cepat dan akurat." },
  jadwal: { eyebrow: "Semester Ganjil 2026/2027", title: "Jadwal Pelajaran", subtitle: "Agenda belajar kelas XI DKV 1 selama satu pekan." },
  tugas: { eyebrow: "Pembelajaran", title: "Tugas & Nilai", subtitle: "Pantau pengumpulan tugas dan perkembangan nilai siswa." },
  pengumuman: { eyebrow: "Komunikasi sekolah", title: "Pengumuman", subtitle: "Sampaikan informasi akademik, kegiatan, dan pesan kepada siswa serta wali santri." },
  portofolio: { eyebrow: "Galeri karya DKV", title: "Portofolio Siswa", subtitle: "Dokumentasikan karya, pencapaian, dan perkembangan kreatif siswa XI DKV 1." },
  pengaturan: { eyebrow: "Konfigurasi sistem", title: "Pengaturan", subtitle: "Atur profil sekolah, kelas, penilaian, absensi, notifikasi, dan hak akses." },
};

function Logo() {
  return (
    <div className="brand-mark" aria-label="Logo SIKELAS Nurul Iman">
      <span className="mark-book">⌄</span>
      <span className="mark-star">✦</span>
    </div>
  );
}

function Dashboard({ goTo, activeClass }: { goTo: (page: PageKey) => void; activeClass: (typeof classOptions)[number] }) {
  const attendanceRate = Math.round((activeClass.present / activeClass.students) * 100);
  const absentCount = activeClass.students - activeClass.present;

  return (
    <>
      <section className="stats-grid" aria-label="Ringkasan kelas">
        <button className="stat-card" onClick={() => goTo("siswa")}>
          <span className="stat-icon green">♙</span><span><small>Jumlah Siswa</small><strong>{activeClass.students}</strong><em>{activeClass.boys} putra · {activeClass.girls} putri</em></span>
        </button>
        <button className="stat-card" onClick={() => goTo("jadwal")}>
          <span className="stat-icon blue">□</span><span><small>Pelajaran Hari Ini</small><strong>4</strong><em>Sampai pukul 14.15</em></span>
        </button>
        <button className="stat-card" onClick={() => goTo("tugas")}>
          <span className="stat-icon gold">✎</span><span><small>Tugas Aktif</small><strong>3</strong><em>1 segera berakhir</em></span>
        </button>
        <button className="stat-card" onClick={() => goTo("absensi")}>
          <span className="stat-icon purple">✓</span><span><small>Kehadiran Hari Ini</small><strong>{attendanceRate}%</strong><em className="positive">↑ 3% dari kemarin</em></span>
        </button>
      </section>

      <section className="dashboard-grid">
        <article className="panel schedule-panel">
          <div className="panel-head"><div><p className="section-kicker">AGENDA HARI INI</p><h2>Jadwal Pelajaran</h2></div><button className="text-button" onClick={() => goTo("jadwal")}>Lihat semua <span>→</span></button></div>
          <div className="schedule-list">
            {schedule.map((item, index) => (
              <div className="schedule-row" key={item.subject}>
                <div className="timeline"><span className={`dot ${item.tone}`}></span>{index < schedule.length - 1 && <i />}</div>
                <time>{item.time}</time>
                <div><strong>{item.subject}</strong><span>{item.teacher}</span></div>
                <span className="room">{item.room}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel attendance-panel">
          <div className="panel-head"><div><p className="section-kicker">KEHADIRAN</p><h2>Absensi Hari Ini</h2></div><button className="icon-button" onClick={() => goTo("absensi")} aria-label="Buka absensi">→</button></div>
          <div className="donut-wrap">
            <div className="donut"><div><strong>{activeClass.present}</strong><span>dari {activeClass.students} siswa</span></div></div>
          </div>
          <div className="legend">
            <span><i className="legend-dot hadir"></i><b>{activeClass.present}</b> Hadir</span>
            <span><i className="legend-dot sakit"></i><b>{Math.min(1, absentCount)}</b> Sakit</span>
            <span><i className="legend-dot izin"></i><b>{Math.max(0, absentCount - 1)}</b> Izin</span>
            <span><i className="legend-dot alpa"></i><b>0</b> Alpa</span>
          </div>
          <button className="primary-button wide" onClick={() => goTo("absensi")}>Isi Absensi Sekarang</button>
        </article>
      </section>

      <section className="bottom-grid">
        <article className="panel tasks-panel">
          <div className="panel-head"><div><p className="section-kicker">PERLU DIPERHATIKAN</p><h2>Tugas Terdekat</h2></div><button className="text-button" onClick={() => goTo("tugas")}>Lihat semua <span>→</span></button></div>
          <div className="mini-tasks">
            {tasks.slice(0, 3).map((task) => <div className="mini-task" key={task.title}><span className={`task-badge ${task.tone}`}>{task.subject.slice(0, 2).toUpperCase()}</span><div><strong>{task.title}</strong><span>{task.subject} · {Math.min(task.submitted, activeClass.students)}/{activeClass.students} terkumpul</span></div><time>{task.due}</time></div>)}
          </div>
        </article>
        <article className="announcement-card">
          <div className="announcement-top"><span>✦</span><small>PENGUMUMAN TERBARU</small></div>
          <h2>Persiapan Lomba Kreativitas Siswa</h2>
          <p>Seleksi karya DKV akan dilaksanakan Jumat, 17 Juli di Lab DKV. Bawa karya terbaikmu!</p>
          <div><span className="avatar tiny">AH</span><small>Ust. Abdurohman Yusuf · 2 jam lalu</small></div>
        </article>
      </section>
    </>
  );
}

function Students({ activeClass }: { activeClass: (typeof classOptions)[number] }) {
  const [query, setQuery] = useState("");
  const filtered = students.filter((student) => student.name.toLowerCase().includes(query.toLowerCase()) || student.nis.includes(query));
  return (
    <article className="panel data-panel">
      <div className="toolbar"><label className="search-field"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama atau NIS..." /></label><div className="toolbar-actions"><button className="secondary-button">⇩ Ekspor</button><button className="primary-button">＋ Tambah Siswa</button></div></div>
      <div className="table-scroll"><table><thead><tr><th>Siswa</th><th>NIS</th><th>Kelas</th><th>JK</th><th>Nomor Wali</th><th>Status</th><th></th></tr></thead><tbody>{filtered.map((student) => <tr key={student.nis}><td><div className="student-name"><span className={`avatar ${student.color}`}>{student.initials}</span><strong>{student.name}</strong></div></td><td>{student.nis}</td><td><span className="class-chip">{activeClass.label}</span></td><td>{student.gender}</td><td>{student.guardian}</td><td><span className="status-chip active">● {student.status}</span></td><td><button className="more-button" aria-label={`Menu ${student.name}`}>•••</button></td></tr>)}</tbody></table></div>
      <div className="table-footer"><span>Menampilkan {filtered.length} dari {activeClass.students} siswa</span><div><button disabled>←</button><button className="current">1</button><button>2</button><button>3</button><button>→</button></div></div>
    </article>
  );
}

function AttendancePage({ activeClass }: { activeClass: string }) {
  const [attendance, setAttendance] = useState<Record<string, Attendance>>(() => Object.fromEntries(students.map((student, index) => [student.nis, index === 3 ? "Sakit" : "Hadir"])));
  const totals = useMemo(() => Object.values(attendance).reduce<Record<Attendance, number>>((result, status) => ({ ...result, [status]: result[status] + 1 }), { Hadir: 0, Sakit: 0, Izin: 0, Alpa: 0, Terlambat: 0 }), [attendance]);
  return (
    <>
      <section className="attendance-summary">{(["Hadir", "Sakit", "Izin", "Alpa", "Terlambat"] as Attendance[]).map((status) => <div key={status}><span className={`legend-dot ${status.toLowerCase()}`}></span><strong>{totals[status]}</strong><small>{status}</small></div>)}</section>
      <article className="panel data-panel">
        <div className="toolbar"><div><h2>Kehadiran {activeClass}</h2><p className="muted">Jam pertama · Desain Grafis</p></div><button className="secondary-button">□ 14 Juli 2026</button></div>
        <div className="attendance-rows">{students.map((student, index) => <div className="attendance-row" key={student.nis}><span className="row-number">{String(index + 1).padStart(2, "0")}</span><span className={`avatar ${student.color}`}>{student.initials}</span><div className="attendance-name"><strong>{student.name}</strong><span>{student.nis}</span></div><div className="attendance-options">{(["Hadir", "Sakit", "Izin", "Alpa", "Terlambat"] as Attendance[]).map((status) => <button className={attendance[student.nis] === status ? `selected ${status.toLowerCase()}` : ""} key={status} onClick={() => setAttendance({ ...attendance, [student.nis]: status })}>{status}</button>)}</div></div>)}</div>
        <div className="sticky-action"><span>Perubahan tersimpan otomatis sebagai draf.</span><button className="primary-button" onClick={() => alert("Absensi berhasil disimpan.")}>Simpan Absensi</button></div>
      </article>
    </>
  );
}

function SchedulePage({ activeClass }: { activeClass: string }) {
  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
  const subjects = [
    ["Matematika", "Desain Grafis", "Bahasa Inggris", "Fotografi"],
    ["Desain Grafis", "Fotografi", "Bahasa Indonesia", "Pendidikan Agama"],
    ["Animasi Dasar", "Animasi Dasar", "Kewirausahaan", "Olahraga"],
    ["Bahasa Inggris", "Desain Grafis", "PKN", "Fotografi"],
    ["Pendidikan Agama", "Bahasa Indonesia", "Proyek Kreatif"],
  ];
  return <article className="panel week-panel"><div className="week-toolbar"><button className="secondary-button">← Minggu lalu</button><strong>13 – 17 Juli 2026</strong><button className="secondary-button">Minggu depan →</button></div><div className="week-grid">{days.map((day, dayIndex) => <section className={day === "Selasa" ? "today-column" : ""} key={day}><div className="day-head"><small>{day}</small><strong>{13 + dayIndex}</strong></div>{subjects[dayIndex].map((subject, index) => <div className={`subject-card tone-${(dayIndex + index) % 4}`} key={`${day}-${subject}-${index}`}><time>{["07.00", "08.30", "10.15", "12.45"][index]}</time><strong>{subject}</strong><span>{index % 2 ? "Lab DKV" : `Ruang ${activeClass}`}</span></div>)}</section>)}</div></article>;
}

function TasksPage({ activeClass }: { activeClass: (typeof classOptions)[number] }) {
  const [tab, setTab] = useState<"tugas" | "nilai">("tugas");
  return <><div className="segmented"><button className={tab === "tugas" ? "active" : ""} onClick={() => setTab("tugas")}>Daftar Tugas</button><button className={tab === "nilai" ? "active" : ""} onClick={() => setTab("nilai")}>Rekap Nilai</button></div>{tab === "tugas" ? <section className="task-grid">{tasks.map((task) => { const submitted = Math.min(task.submitted, activeClass.students); return <article className="panel task-card" key={task.title}><div className="task-card-top"><span className={`task-badge large ${task.tone}`}>{task.subject.slice(0, 2).toUpperCase()}</span><span className={`status-chip ${task.status === "Selesai" ? "done" : "active"}`}>{task.status}</span></div><small>{task.subject} · {activeClass.label}</small><h2>{task.title}</h2><p>Batas pengumpulan <strong>{task.due}</strong></p><div className="progress-label"><span>Terkumpul</span><strong>{submitted}/{activeClass.students}</strong></div><div className="progress"><i style={{ width: `${(submitted / activeClass.students) * 100}%` }} /></div><button className="secondary-button wide">Lihat Pengumpulan</button></article>; })}</section> : <article className="panel data-panel"><div className="toolbar"><div><h2>Rekap Nilai {activeClass.label}</h2><p className="muted">Nilai akhir semester ganjil</p></div><button className="secondary-button">⇩ Unduh Rekap</button></div><div className="table-scroll"><table><thead><tr><th>Siswa</th><th>Tugas</th><th>Praktik</th><th>Ujian</th><th>Sikap</th><th>Nilai Akhir</th></tr></thead><tbody>{students.map((student, index) => { const score = 84 + (index % 5); return <tr key={student.nis}><td><div className="student-name"><span className={`avatar ${student.color}`}>{student.initials}</span><strong>{student.name}</strong></div></td><td>{82 + index}</td><td>{88 - index}</td><td>{80 + index}</td><td><span className="grade-attitude">A</span></td><td><strong className="final-score">{score}</strong></td></tr>; })}</tbody></table></div></article>}</>;
}

function AnnouncementsPage({ activeClass }: { activeClass: string }) {
  const [filter, setFilter] = useState("Semua");
  const [composing, setComposing] = useState(false);
  const categories = ["Semua", "Akademik", "Kegiatan", "Pesantren", "Administrasi"];
  const visible = announcements.filter((item) => (filter === "Semua" || item.category === filter) && (item.audience === "Semua Kelas" || item.audience === activeClass));

  return <>
    <section className="module-stats"><div><span className="module-icon teal">☏</span><span><strong>{announcements.filter((item) => item.status === "Terbit").length}</strong><small>Sudah terbit</small></span></div><div><span className="module-icon orange">!</span><span><strong>{announcements.filter((item) => item.priority === "Penting").length}</strong><small>Prioritas penting</small></span></div><div><span className="module-icon blue">◎</span><span><strong>{visible.length}</strong><small>Untuk {activeClass}</small></span></div></section>
    <article className="panel module-panel">
      <div className="toolbar"><div className="filter-row">{categories.map((category) => <button className={filter === category ? "active" : ""} key={category} onClick={() => setFilter(category)}>{category}</button>)}</div><button className="primary-button" onClick={() => setComposing(!composing)}>{composing ? "Tutup Form" : "＋ Buat Pengumuman"}</button></div>
      {composing && <form className="inline-form" onSubmit={(event) => { event.preventDefault(); setComposing(false); alert("Pengumuman berhasil disimpan sebagai draf."); }}><div className="form-grid"><label>Judul pengumuman<input required placeholder="Contoh: Jadwal kegiatan kelas" /></label><label>Kategori<select defaultValue="Akademik"><option>Akademik</option><option>Kegiatan</option><option>Pesantren</option><option>Administrasi</option><option>Perlengkapan</option></select></label><label>Sasaran<select defaultValue={activeClass}><option>Semua Kelas</option>{classOptions.map((item) => <option key={item.label}>{item.label}</option>)}</select></label><label>Tanggal terbit<input type="date" defaultValue="2026-07-15" /></label></div><label>Isi pengumuman<textarea required rows={4} placeholder="Tuliskan informasi secara lengkap..." /></label><div className="form-actions"><button type="button" className="secondary-button" onClick={() => setComposing(false)}>Batal</button><button className="primary-button" type="submit">Simpan Draf</button></div></form>}
      <div className="announcement-list">{visible.map((item) => <article className="announcement-item" key={item.title}><div className={`announcement-symbol ${item.category.toLowerCase()}`}>{item.category.slice(0, 2).toUpperCase()}</div><div className="announcement-body"><div className="announcement-meta"><span>{item.category}</span><i>•</i><span>{item.audience}</span><i>•</i><time>{item.date}</time></div><h2>{item.title}</h2><p>{item.excerpt}</p><small>Oleh {item.author}</small></div><div className="announcement-state"><span className={`priority ${item.priority.toLowerCase()}`}>{item.priority}</span><span className={`status-chip ${item.status === "Terbit" ? "active" : item.status === "Draf" ? "done" : ""}`}>{item.status}</span><button aria-label={`Menu ${item.title}`}>•••</button></div></article>)}</div>
      {visible.length === 0 && <div className="empty-state"><span>☏</span><strong>Belum ada pengumuman</strong><p>Tidak ada pengumuman dalam kategori ini untuk {activeClass}.</p></div>}
    </article>
  </>;
}

function PortfolioPage({ activeClass }: { activeClass: string }) {
  const [filter, setFilter] = useState("Semua Karya");
  const [uploading, setUploading] = useState(false);
  const types = ["Semua Karya", "Desain Grafis", "Fotografi", "Video", "Animasi", "Website"];
  const classWorks = portfolioItems.filter((item) => item.className === activeClass);
  const visible = classWorks.filter((item) => filter === "Semua Karya" || item.type === filter);

  return <>
    <section className="portfolio-summary"><article className="panel"><strong>{classWorks.length}</strong><span>Total karya</span><i>◇</i></article><article className="panel"><strong>{classWorks.filter((item) => item.status === "Terpilih").length}</strong><span>Karya terpilih</span><i>★</i></article><article className="panel"><strong>{classWorks.length ? Math.round(classWorks.reduce((total, item) => total + item.score, 0) / classWorks.length) : 0}</strong><span>Rata-rata nilai</span><i>✓</i></article></section>
    <article className="panel module-panel"><div className="toolbar"><div className="filter-row">{types.map((type) => <button className={filter === type ? "active" : ""} key={type} onClick={() => setFilter(type)}>{type}</button>)}</div><button className="primary-button" onClick={() => setUploading(!uploading)}>{uploading ? "Tutup Form" : "＋ Tambah Karya"}</button></div>
      {uploading && <form className="inline-form" onSubmit={(event) => { event.preventDefault(); setUploading(false); alert("Karya berhasil disimpan dan menunggu peninjauan."); }}><div className="form-grid"><label>Judul karya<input required placeholder="Nama proyek atau karya" /></label><label>Nama siswa<select>{students.map((student) => <option key={student.nis}>{student.name}</option>)}</select></label><label>Jenis karya<select>{types.slice(1).map((type) => <option key={type}>{type}</option>)}</select></label><label>Kelas<input readOnly value={activeClass} /></label></div><label>Deskripsi karya<textarea rows={3} placeholder="Konsep, proses, dan perangkat yang digunakan..." /></label><div className="upload-zone"><span>⇧</span><div><strong>Pilih berkas karya</strong><small>JPG, PNG, PDF, MP4, atau tautan proyek · Maks. 20 MB</small></div><input aria-label="Unggah berkas karya" type="file" /></div><div className="form-actions"><button type="button" className="secondary-button" onClick={() => setUploading(false)}>Batal</button><button className="primary-button" type="submit">Simpan Karya</button></div></form>}
      <div className="portfolio-grid">{visible.map((item) => <article className="portfolio-card" key={item.title}><div className={`portfolio-cover ${item.tone}`}><span>{item.type === "Fotografi" ? "▣" : item.type === "Video" ? "▶" : item.type === "Website" ? "⌘" : "◇"}</span><small>{item.type}</small><b>{item.score}</b></div><div className="portfolio-info"><div><span className={`status-chip ${item.status === "Terpilih" || item.status === "Dipublikasi" ? "active" : "done"}`}>{item.status}</span><time>{item.date}</time></div><h2>{item.title}</h2><p>{item.student} · {item.className}</p><button className="secondary-button wide">Lihat Detail</button></div></article>)}</div>
      {visible.length === 0 && <div className="empty-state"><span>◇</span><strong>Belum ada karya</strong><p>Belum ada karya {filter === "Semua Karya" ? "" : filter.toLowerCase()} untuk {activeClass}.</p></div>}
    </article>
  </>;
}

function SettingsPage({ activeClass }: { activeClass: (typeof classOptions)[number] }) {
  const [tab, setTab] = useState("Sekolah & Kelas");
  const [saved, setSaved] = useState(false);
  const tabs = ["Sekolah & Kelas", "Absensi", "Penilaian", "Notifikasi", "Hak Akses"];
  const save = (event: React.FormEvent) => { event.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return <div className="settings-layout"><aside className="panel settings-nav">{tabs.map((item) => <button className={tab === item ? "active" : ""} key={item} onClick={() => setTab(item)}><span>{item === "Sekolah & Kelas" ? "▦" : item === "Absensi" ? "✓" : item === "Penilaian" ? "☆" : item === "Notifikasi" ? "♢" : "♙"}</span>{item}</button>)}</aside><form className="panel settings-content" onSubmit={save}>
    {tab === "Sekolah & Kelas" && <><div className="settings-head"><div><h2>Profil Sekolah dan Kelas</h2><p>Informasi ini tampil pada laporan dan dokumen kelas.</p></div><span className="settings-tag">Kelas aktif: {activeClass.label}</span></div><div className="settings-section"><h3>Identitas sekolah</h3><div className="form-grid"><label>Nama sekolah<input defaultValue="SMK Nurul Iman" /></label><label>NPSN<input defaultValue="69912345" /></label><label>Email sekolah<input type="email" defaultValue="admin@nuruliman.sch.id" /></label><label>Nomor telepon<input defaultValue="(0251) 8654 321" /></label></div><label>Alamat sekolah<textarea rows={3} defaultValue="Kabupaten Bogor, Jawa Barat" /></label></div><div className="settings-section"><h3>Data kelas aktif</h3><div className="form-grid"><label>Nama kelas<input readOnly value={activeClass.label} /></label><label>Wali kelas<input defaultValue="Ust. Abdurohman Yusuf" /></label><label>Tahun ajaran<select defaultValue="2026/2027"><option>2026/2027</option><option>2025/2026</option></select></label><label>Ruangan<input defaultValue={`Ruang ${activeClass.label}`} /></label></div></div></>}
    {tab === "Absensi" && <><div className="settings-head"><div><h2>Aturan Absensi</h2><p>Tentukan jam masuk dan perhitungan status kehadiran.</p></div></div><div className="settings-section"><div className="form-grid"><label>Jam masuk<input type="time" defaultValue="07:00" /></label><label>Batas terlambat<input type="time" defaultValue="07:15" /></label><label>Jam pulang<input type="time" defaultValue="14:15" /></label><label>Minimum kehadiran<select defaultValue="80%"><option>75%</option><option>80%</option><option>85%</option></select></label></div><div className="toggle-list"><label><span><strong>Izinkan koreksi absensi</strong><small>Guru dapat memperbaiki status pada hari yang sama.</small></span><input type="checkbox" defaultChecked /></label><label><span><strong>Kirim ringkasan kepada wali</strong><small>Ringkasan ketidakhadiran dikirim setiap akhir pekan.</small></span><input type="checkbox" defaultChecked /></label></div></div></>}
    {tab === "Penilaian" && <><div className="settings-head"><div><h2>Bobot Penilaian</h2><p>Total bobot nilai akhir harus berjumlah 100%.</p></div><span className="settings-tag">Total 100%</span></div><div className="weight-grid"><label><span>Tugas</span><input type="number" defaultValue="25" min="0" max="100" /><b>%</b></label><label><span>Praktik</span><input type="number" defaultValue="35" min="0" max="100" /><b>%</b></label><label><span>Ujian</span><input type="number" defaultValue="30" min="0" max="100" /><b>%</b></label><label><span>Sikap</span><input type="number" defaultValue="10" min="0" max="100" /><b>%</b></label></div><div className="settings-section"><div className="form-grid"><label>KKM<input type="number" defaultValue="75" /></label><label>Skala nilai<select defaultValue="0–100"><option>0–100</option><option>A–E</option></select></label></div></div></>}
    {tab === "Notifikasi" && <><div className="settings-head"><div><h2>Preferensi Notifikasi</h2><p>Pilih informasi yang dikirim kepada guru dan wali santri.</p></div></div><div className="toggle-list large"><label><span><strong>Tugas belum dikumpulkan</strong><small>Kirim pengingat satu hari sebelum tenggat.</small></span><input type="checkbox" defaultChecked /></label><label><span><strong>Ketidakhadiran siswa</strong><small>Beritahu wali ketika siswa tidak hadir.</small></span><input type="checkbox" defaultChecked /></label><label><span><strong>Pengumuman baru</strong><small>Kirim notifikasi saat pengumuman diterbitkan.</small></span><input type="checkbox" defaultChecked /></label><label><span><strong>Portofolio disetujui</strong><small>Beritahu siswa ketika karya selesai ditinjau.</small></span><input type="checkbox" /></label></div></>}
    {tab === "Hak Akses" && <><div className="settings-head"><div><h2>Hak Akses Pengguna</h2><p>Ringkasan izin untuk setiap peran dalam SIKELAS.</p></div></div><div className="role-table"><div className="role-row head"><span>Peran</span><span>Data siswa</span><span>Absensi</span><span>Nilai</span><span>Pengaturan</span></div>{[["Admin","Penuh","Penuh","Penuh","Penuh"],["Wali Kelas","Lihat","Penuh","Penuh","Terbatas"],["Guru","Lihat","Input","Input","—"],["Siswa","Sendiri","Lihat","Lihat","—"],["Wali Santri","Anak","Lihat","Lihat","—"]].map((role) => <div className="role-row" key={role[0]}>{role.map((cell, index) => <span className={index > 0 && cell !== "—" ? "allowed" : ""} key={cell + index}>{index > 0 && cell !== "—" ? "✓ " : ""}{cell}</span>)}</div>)}</div></>}
    <div className="settings-actions">{saved && <span>✓ Perubahan berhasil disimpan</span>}<button className="primary-button" type="submit">Simpan Perubahan</button></div>
  </form></div>;
}

export default function Home() {
  const [page, setPage] = useState<PageKey>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [loggedIn, setLoggedIn] = useState(true);
  const [activeClass, setActiveClass] = useState<(typeof classOptions)[number]>(classOptions[1]);
  const [classMenuOpen, setClassMenuOpen] = useState(false);
  const meta = {
    ...pageMeta[page],
    subtitle: pageMeta[page].subtitle.replaceAll("XI DKV 1", activeClass.label),
  };

  if (!loggedIn) return <main className="login-page"><section className="login-brand"><div><Logo /><p>SIKELAS NURUL IMAN</p></div><div><span className="login-ornament">✦</span><h1>Belajar, Berkarya,<br />dan Bertumbuh <em>Bersama.</em></h1><p>Sistem informasi kelas yang menyatukan guru, siswa, dan wali santri dalam satu ruang belajar.</p></div><small>SMK Nurul Iman · Kabupaten Bogor</small></section><section className="login-form-wrap"><form className="login-card" onSubmit={(e) => { e.preventDefault(); setLoggedIn(true); }}><p className="section-kicker">SELAMAT DATANG KEMBALI</p><h2>Masuk ke SIKELAS</h2><p>Silakan gunakan akun sekolah Anda.</p><label>Email atau NIS<input type="text" defaultValue="guru@nuruliman.sch.id" /></label><label>Kata sandi<input type="password" defaultValue="nuruliman" /></label><div className="login-help"><label><input type="checkbox" defaultChecked /> Ingat saya</label><button type="button">Lupa kata sandi?</button></div><button className="primary-button wide" type="submit">Masuk ke Dashboard →</button><small>Demo: klik tombol masuk untuk melanjutkan.</small></form></section></main>;

  return (
    <div className="app-shell">
      <aside className={menuOpen ? "sidebar open" : "sidebar"}>
        <div className="brand"><Logo /><div><strong>SIKELAS</strong><span>NURUL IMAN</span></div><button className="mobile-close" onClick={() => setMenuOpen(false)}>×</button></div>
        <div className="class-switcher">
          <button className="class-selector" onClick={() => setClassMenuOpen(!classMenuOpen)} aria-expanded={classMenuOpen} aria-haspopup="menu">
            <span className="class-icon">{activeClass.short}</span><span className="class-copy"><small>KELAS AKTIF</small><strong>{activeClass.label}</strong></span><span className="class-chevron">⌄</span>
          </button>
          <div className={classMenuOpen ? "class-menu open" : "class-menu"} role="menu" aria-label="Pilih kelas">
            {classOptions.map((classItem) => <button role="menuitem" className={activeClass.label === classItem.label ? "active" : ""} key={classItem.label} onClick={() => { setActiveClass(classItem); setClassMenuOpen(false); }}><span>{classItem.short}</span><span><strong>{classItem.label}</strong><small>{classItem.students} siswa</small></span>{activeClass.label === classItem.label && <b>✓</b>}</button>)}
          </div>
        </div>
        <nav aria-label="Menu utama"><small>MENU UTAMA</small>{navItems.map((item) => <button className={page === item.key ? "active" : ""} key={item.key} onClick={() => { setPage(item.key); setMenuOpen(false); }}><span>{item.icon}</span>{item.label}{item.key === "tugas" && <i>3</i>}</button>)}</nav>
        <nav className="secondary-nav" aria-label="Menu lainnya"><small>LAINNYA</small>{secondaryNavItems.map((item) => <button className={page === item.key ? "active" : ""} key={item.key} onClick={() => { setPage(item.key); setMenuOpen(false); }}><span>{item.icon}</span>{item.label}{item.key === "pengumuman" && <i>3</i>}</button>)}</nav>
        <div className="sidebar-footer"><button className="user-card"><span className="avatar teacher">SR</span><span><strong>Siti Rahma</strong><small>Guru DKV</small></span><i>•••</i></button><button className="logout" onClick={() => setLoggedIn(false)}>↪ Keluar</button></div>
      </aside>
      {menuOpen && <button className="overlay" onClick={() => setMenuOpen(false)} aria-label="Tutup menu" />}
      <main className="main-content">
        <header className="topbar"><button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Buka menu">☰</button><div className="top-context"><strong>{page === "dashboard" ? "Dashboard" : meta.title}</strong><span>SIKELAS <i>/</i> {[...navItems, ...secondaryNavItems].find((item) => item.key === page)?.label} <i>/</i> {activeClass.label}</span></div><div className="topbar-spacer" /><label className="top-search"><span>⌕</span><input placeholder="Cari siswa, tugas, atau materi..." /></label><div className="notification-wrap"><button className="notification-button" onClick={() => setNotifications(!notifications)} aria-label="Notifikasi">♢<i /></button>{notifications && <div className="notification-popover"><strong>Notifikasi</strong><p>3 tugas menunggu penilaian.</p><p>Absensi hari ini belum dikunci.</p></div>}</div><button className="top-profile"><span className="avatar teacher">AY</span><span><strong>Abdurohman Yusuf</strong><small>Guru DKV</small></span><b>⌄</b></button></header>
        <div className="page-wrap">
          <div className="page-heading"><div><p>{meta.eyebrow}</p><h1>{meta.title}</h1><span>{meta.subtitle}</span></div>{page === "dashboard" && <div className="weather"><span>☀</span><div><strong>28°C</strong><small>Cerah · Bogor</small></div></div>}</div>
          {page === "dashboard" && <Dashboard goTo={setPage} activeClass={activeClass} />}
          {page === "siswa" && <Students activeClass={activeClass} />}
          {page === "absensi" && <AttendancePage key={activeClass.label} activeClass={activeClass.label} />}
          {page === "jadwal" && <SchedulePage activeClass={activeClass.label} />}
          {page === "tugas" && <TasksPage activeClass={activeClass} />}
          {page === "pengumuman" && <AnnouncementsPage activeClass={activeClass.label} />}
          {page === "portofolio" && <PortfolioPage activeClass={activeClass.label} />}
          {page === "pengaturan" && <SettingsPage activeClass={activeClass} />}
        </div>
      </main>
    </div>
  );
}
