"use client";

import { useMemo, useState } from "react";

type PageKey = "dashboard" | "siswa" | "absensi" | "jadwal" | "tugas";
type Attendance = "Hadir" | "Sakit" | "Izin" | "Alpa" | "Terlambat";

const students = [
  { name: "Ahmad Fauzan", nis: "231001", class: "XI DKV 1", gender: "L", guardian: "0812 3456 7890", status: "Aktif", initials: "AF", color: "mint" },
  { name: "Aisyah Putri", nis: "231002", class: "XI DKV 1", gender: "P", guardian: "0857 1122 3344", status: "Aktif", initials: "AP", color: "peach" },
  { name: "Bagas Maulana", nis: "231003", class: "XI DKV 1", gender: "L", guardian: "0813 9087 6543", status: "Aktif", initials: "BM", color: "blue" },
  { name: "Citra Lestari", nis: "231004", class: "XI DKV 1", gender: "P", guardian: "0821 4455 6677", status: "Aktif", initials: "CL", color: "lilac" },
  { name: "Dimas Pratama", nis: "231005", class: "XI DKV 1", gender: "L", guardian: "0895 7788 9900", status: "Aktif", initials: "DP", color: "yellow" },
  { name: "Farah Nabila", nis: "231006", class: "XI DKV 1", gender: "P", guardian: "0819 2233 4455", status: "Aktif", initials: "FN", color: "pink" },
];

const schedule = [
  { time: "07.00 – 08.30", subject: "Desain Grafis", teacher: "Ibu Siti Rahma, S.Ds.", room: "Lab DKV", tone: "green" },
  { time: "08.30 – 10.00", subject: "Fotografi", teacher: "Bapak Arif Hidayat", room: "Studio Foto", tone: "gold" },
  { time: "10.15 – 11.45", subject: "Bahasa Indonesia", teacher: "Ibu Nur Khasanah, S.Pd.", room: "Ruang XI DKV 1", tone: "blue" },
  { time: "12.45 – 14.15", subject: "Pendidikan Agama", teacher: "Ust. Abdul Karim", room: "Masjid", tone: "purple" },
];

const tasks = [
  { title: "Poster Hari Kemerdekaan", subject: "Desain Grafis", due: "16 Jul 2026", submitted: 28, total: 32, status: "Berjalan", tone: "green" },
  { title: "Foto Produk Lokal", subject: "Fotografi", due: "18 Jul 2026", submitted: 21, total: 32, status: "Berjalan", tone: "gold" },
  { title: "Esai Budaya Pesantren", subject: "Bahasa Indonesia", due: "20 Jul 2026", submitted: 12, total: 32, status: "Baru", tone: "blue" },
  { title: "Animasi Logo Sekolah", subject: "Animasi Dasar", due: "11 Jul 2026", submitted: 31, total: 32, status: "Selesai", tone: "purple" },
];

const navItems: { key: PageKey; label: string; icon: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "⌂" },
  { key: "siswa", label: "Data Siswa", icon: "♙" },
  { key: "absensi", label: "Absensi", icon: "✓" },
  { key: "jadwal", label: "Jadwal Pelajaran", icon: "□" },
  { key: "tugas", label: "Tugas & Nilai", icon: "✎" },
];

const pageMeta: Record<PageKey, { eyebrow: string; title: string; subtitle: string }> = {
  dashboard: { eyebrow: "Selasa, 14 Juli 2026", title: "Assalamu’alaikum, Bu Siti!", subtitle: "Berikut ringkasan kegiatan kelas XI DKV 1 hari ini." },
  siswa: { eyebrow: "Manajemen kelas", title: "Data Siswa", subtitle: "Kelola identitas dan status siswa XI DKV 1." },
  absensi: { eyebrow: "Selasa, 14 Juli 2026", title: "Absensi Harian", subtitle: "Catat kehadiran siswa dengan cepat dan akurat." },
  jadwal: { eyebrow: "Semester Ganjil 2026/2027", title: "Jadwal Pelajaran", subtitle: "Agenda belajar kelas XI DKV 1 selama satu pekan." },
  tugas: { eyebrow: "Pembelajaran", title: "Tugas & Nilai", subtitle: "Pantau pengumpulan tugas dan perkembangan nilai siswa." },
};

function Logo() {
  return (
    <div className="brand-mark" aria-label="Logo SIKELAS Nurul Iman">
      <span className="mark-book">⌄</span>
      <span className="mark-star">✦</span>
    </div>
  );
}

function Dashboard({ goTo }: { goTo: (page: PageKey) => void }) {
  return (
    <>
      <section className="stats-grid" aria-label="Ringkasan kelas">
        <button className="stat-card" onClick={() => goTo("siswa")}>
          <span className="stat-icon green">♙</span><span><small>Jumlah Siswa</small><strong>32</strong><em>18 putra · 14 putri</em></span>
        </button>
        <button className="stat-card" onClick={() => goTo("jadwal")}>
          <span className="stat-icon blue">□</span><span><small>Pelajaran Hari Ini</small><strong>4</strong><em>Sampai pukul 14.15</em></span>
        </button>
        <button className="stat-card" onClick={() => goTo("tugas")}>
          <span className="stat-icon gold">✎</span><span><small>Tugas Aktif</small><strong>3</strong><em>1 segera berakhir</em></span>
        </button>
        <button className="stat-card" onClick={() => goTo("absensi")}>
          <span className="stat-icon purple">✓</span><span><small>Kehadiran Hari Ini</small><strong>91%</strong><em className="positive">↑ 3% dari kemarin</em></span>
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
            <div className="donut"><div><strong>29</strong><span>dari 32 siswa</span></div></div>
          </div>
          <div className="legend">
            <span><i className="legend-dot hadir"></i><b>29</b> Hadir</span>
            <span><i className="legend-dot sakit"></i><b>1</b> Sakit</span>
            <span><i className="legend-dot izin"></i><b>1</b> Izin</span>
            <span><i className="legend-dot alpa"></i><b>1</b> Alpa</span>
          </div>
          <button className="primary-button wide" onClick={() => goTo("absensi")}>Isi Absensi Sekarang</button>
        </article>
      </section>

      <section className="bottom-grid">
        <article className="panel tasks-panel">
          <div className="panel-head"><div><p className="section-kicker">PERLU DIPERHATIKAN</p><h2>Tugas Terdekat</h2></div><button className="text-button" onClick={() => goTo("tugas")}>Lihat semua <span>→</span></button></div>
          <div className="mini-tasks">
            {tasks.slice(0, 3).map((task) => <div className="mini-task" key={task.title}><span className={`task-badge ${task.tone}`}>{task.subject.slice(0, 2).toUpperCase()}</span><div><strong>{task.title}</strong><span>{task.subject} · {task.submitted}/{task.total} terkumpul</span></div><time>{task.due}</time></div>)}
          </div>
        </article>
        <article className="announcement-card">
          <div className="announcement-top"><span>✦</span><small>PENGUMUMAN TERBARU</small></div>
          <h2>Persiapan Lomba Kreativitas Siswa</h2>
          <p>Seleksi karya DKV akan dilaksanakan Jumat, 17 Juli di Lab DKV. Bawa karya terbaikmu!</p>
          <div><span className="avatar tiny">AH</span><small>Pak Arif · 2 jam lalu</small></div>
        </article>
      </section>
    </>
  );
}

function Students() {
  const [query, setQuery] = useState("");
  const filtered = students.filter((student) => student.name.toLowerCase().includes(query.toLowerCase()) || student.nis.includes(query));
  return (
    <article className="panel data-panel">
      <div className="toolbar"><label className="search-field"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama atau NIS..." /></label><div className="toolbar-actions"><button className="secondary-button">⇩ Ekspor</button><button className="primary-button">＋ Tambah Siswa</button></div></div>
      <div className="table-scroll"><table><thead><tr><th>Siswa</th><th>NIS</th><th>Kelas</th><th>JK</th><th>Nomor Wali</th><th>Status</th><th></th></tr></thead><tbody>{filtered.map((student) => <tr key={student.nis}><td><div className="student-name"><span className={`avatar ${student.color}`}>{student.initials}</span><strong>{student.name}</strong></div></td><td>{student.nis}</td><td><span className="class-chip">{student.class}</span></td><td>{student.gender}</td><td>{student.guardian}</td><td><span className="status-chip active">● {student.status}</span></td><td><button className="more-button" aria-label={`Menu ${student.name}`}>•••</button></td></tr>)}</tbody></table></div>
      <div className="table-footer"><span>Menampilkan {filtered.length} dari 32 siswa</span><div><button disabled>←</button><button className="current">1</button><button>2</button><button>3</button><button>→</button></div></div>
    </article>
  );
}

function AttendancePage() {
  const [attendance, setAttendance] = useState<Record<string, Attendance>>(() => Object.fromEntries(students.map((student, index) => [student.nis, index === 3 ? "Sakit" : "Hadir"])));
  const totals = useMemo(() => Object.values(attendance).reduce<Record<Attendance, number>>((result, status) => ({ ...result, [status]: result[status] + 1 }), { Hadir: 0, Sakit: 0, Izin: 0, Alpa: 0, Terlambat: 0 }), [attendance]);
  return (
    <>
      <section className="attendance-summary">{(["Hadir", "Sakit", "Izin", "Alpa", "Terlambat"] as Attendance[]).map((status) => <div key={status}><span className={`legend-dot ${status.toLowerCase()}`}></span><strong>{totals[status]}</strong><small>{status}</small></div>)}</section>
      <article className="panel data-panel">
        <div className="toolbar"><div><h2>Kehadiran XI DKV 1</h2><p className="muted">Jam pertama · Desain Grafis</p></div><button className="secondary-button">□ 14 Juli 2026</button></div>
        <div className="attendance-rows">{students.map((student, index) => <div className="attendance-row" key={student.nis}><span className="row-number">{String(index + 1).padStart(2, "0")}</span><span className={`avatar ${student.color}`}>{student.initials}</span><div className="attendance-name"><strong>{student.name}</strong><span>{student.nis}</span></div><div className="attendance-options">{(["Hadir", "Sakit", "Izin", "Alpa", "Terlambat"] as Attendance[]).map((status) => <button className={attendance[student.nis] === status ? `selected ${status.toLowerCase()}` : ""} key={status} onClick={() => setAttendance({ ...attendance, [student.nis]: status })}>{status}</button>)}</div></div>)}</div>
        <div className="sticky-action"><span>Perubahan tersimpan otomatis sebagai draf.</span><button className="primary-button" onClick={() => alert("Absensi berhasil disimpan.")}>Simpan Absensi</button></div>
      </article>
    </>
  );
}

function SchedulePage() {
  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
  const subjects = [
    ["Matematika", "Desain Grafis", "Bahasa Inggris", "Fotografi"],
    ["Desain Grafis", "Fotografi", "Bahasa Indonesia", "Pendidikan Agama"],
    ["Animasi Dasar", "Animasi Dasar", "Kewirausahaan", "Olahraga"],
    ["Bahasa Inggris", "Desain Grafis", "PKN", "Fotografi"],
    ["Pendidikan Agama", "Bahasa Indonesia", "Proyek Kreatif"],
  ];
  return <article className="panel week-panel"><div className="week-toolbar"><button className="secondary-button">← Minggu lalu</button><strong>13 – 17 Juli 2026</strong><button className="secondary-button">Minggu depan →</button></div><div className="week-grid">{days.map((day, dayIndex) => <section className={day === "Selasa" ? "today-column" : ""} key={day}><div className="day-head"><small>{day}</small><strong>{13 + dayIndex}</strong></div>{subjects[dayIndex].map((subject, index) => <div className={`subject-card tone-${(dayIndex + index) % 4}`} key={`${day}-${subject}-${index}`}><time>{["07.00", "08.30", "10.15", "12.45"][index]}</time><strong>{subject}</strong><span>{index % 2 ? "Lab DKV" : "Ruang XI DKV 1"}</span></div>)}</section>)}</div></article>;
}

function TasksPage() {
  const [tab, setTab] = useState<"tugas" | "nilai">("tugas");
  return <><div className="segmented"><button className={tab === "tugas" ? "active" : ""} onClick={() => setTab("tugas")}>Daftar Tugas</button><button className={tab === "nilai" ? "active" : ""} onClick={() => setTab("nilai")}>Rekap Nilai</button></div>{tab === "tugas" ? <section className="task-grid">{tasks.map((task) => <article className="panel task-card" key={task.title}><div className="task-card-top"><span className={`task-badge large ${task.tone}`}>{task.subject.slice(0, 2).toUpperCase()}</span><span className={`status-chip ${task.status === "Selesai" ? "done" : "active"}`}>{task.status}</span></div><small>{task.subject}</small><h2>{task.title}</h2><p>Batas pengumpulan <strong>{task.due}</strong></p><div className="progress-label"><span>Terkumpul</span><strong>{task.submitted}/{task.total}</strong></div><div className="progress"><i style={{ width: `${(task.submitted / task.total) * 100}%` }} /></div><button className="secondary-button wide">Lihat Pengumpulan</button></article>)}</section> : <article className="panel data-panel"><div className="toolbar"><div><h2>Rekap Nilai Siswa</h2><p className="muted">Nilai akhir semester ganjil</p></div><button className="secondary-button">⇩ Unduh Rekap</button></div><div className="table-scroll"><table><thead><tr><th>Siswa</th><th>Tugas</th><th>Praktik</th><th>Ujian</th><th>Sikap</th><th>Nilai Akhir</th></tr></thead><tbody>{students.map((student, index) => { const score = 84 + (index % 5); return <tr key={student.nis}><td><div className="student-name"><span className={`avatar ${student.color}`}>{student.initials}</span><strong>{student.name}</strong></div></td><td>{82 + index}</td><td>{88 - index}</td><td>{80 + index}</td><td><span className="grade-attitude">A</span></td><td><strong className="final-score">{score}</strong></td></tr>; })}</tbody></table></div></article>}</>;
}

export default function Home() {
  const [page, setPage] = useState<PageKey>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [loggedIn, setLoggedIn] = useState(true);
  const meta = pageMeta[page];

  if (!loggedIn) return <main className="login-page"><section className="login-brand"><div><Logo /><p>SIKELAS NURUL IMAN</p></div><div><span className="login-ornament">✦</span><h1>Belajar, Berkarya,<br />dan Bertumbuh <em>Bersama.</em></h1><p>Sistem informasi kelas yang menyatukan guru, siswa, dan wali santri dalam satu ruang belajar.</p></div><small>SMK Nurul Iman · Kabupaten Bogor</small></section><section className="login-form-wrap"><form className="login-card" onSubmit={(e) => { e.preventDefault(); setLoggedIn(true); }}><p className="section-kicker">SELAMAT DATANG KEMBALI</p><h2>Masuk ke SIKELAS</h2><p>Silakan gunakan akun sekolah Anda.</p><label>Email atau NIS<input type="text" defaultValue="guru@nuruliman.sch.id" /></label><label>Kata sandi<input type="password" defaultValue="nuruliman" /></label><div className="login-help"><label><input type="checkbox" defaultChecked /> Ingat saya</label><button type="button">Lupa kata sandi?</button></div><button className="primary-button wide" type="submit">Masuk ke Dashboard →</button><small>Demo: klik tombol masuk untuk melanjutkan.</small></form></section></main>;

  return (
    <div className="app-shell">
      <aside className={menuOpen ? "sidebar open" : "sidebar"}>
        <div className="brand"><Logo /><div><strong>SIKELAS</strong><span>NURUL IMAN</span></div><button className="mobile-close" onClick={() => setMenuOpen(false)}>×</button></div>
        <div className="class-selector"><span className="class-icon">XI</span><div><small>KELAS AKTIF</small><strong>XI DKV 1</strong></div><button>⌄</button></div>
        <nav aria-label="Menu utama"><small>MENU UTAMA</small>{navItems.map((item) => <button className={page === item.key ? "active" : ""} key={item.key} onClick={() => { setPage(item.key); setMenuOpen(false); }}><span>{item.icon}</span>{item.label}{item.key === "tugas" && <i>3</i>}</button>)}</nav>
        <nav className="secondary-nav" aria-label="Menu lainnya"><small>LAINNYA</small><button><span>☏</span>Pengumuman</button><button><span>◇</span>Portofolio</button><button><span>⚙</span>Pengaturan</button></nav>
        <div className="sidebar-footer"><button className="user-card"><span className="avatar teacher">SR</span><span><strong>Siti Rahma</strong><small>Guru DKV</small></span><i>•••</i></button><button className="logout" onClick={() => setLoggedIn(false)}>↪ Keluar</button></div>
      </aside>
      {menuOpen && <button className="overlay" onClick={() => setMenuOpen(false)} aria-label="Tutup menu" />}
      <main className="main-content">
        <header className="topbar"><button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Buka menu">☰</button><div className="top-context"><strong>{pageMeta[page].title.replace("Assalamu’alaikum, Bu Siti!", "Dashboard")}</strong><span>SIKELAS <i>/</i> {navItems.find((item) => item.key === page)?.label}</span></div><div className="topbar-spacer" /><label className="top-search"><span>⌕</span><input placeholder="Cari siswa, tugas, atau materi..." /></label><div className="notification-wrap"><button className="notification-button" onClick={() => setNotifications(!notifications)} aria-label="Notifikasi">♢<i /></button>{notifications && <div className="notification-popover"><strong>Notifikasi</strong><p>3 tugas menunggu penilaian.</p><p>Absensi hari ini belum dikunci.</p></div>}</div><button className="top-profile"><span className="avatar teacher">SR</span><span><strong>Siti Rahma</strong><small>Guru DKV</small></span><b>⌄</b></button></header>
        <div className="page-wrap">
          <div className="page-heading"><div><p>{meta.eyebrow}</p><h1>{meta.title}</h1><span>{meta.subtitle}</span></div>{page === "dashboard" && <div className="weather"><span>☀</span><div><strong>28°C</strong><small>Cerah · Bogor</small></div></div>}</div>
          {page === "dashboard" && <Dashboard goTo={setPage} />}
          {page === "siswa" && <Students />}
          {page === "absensi" && <AttendancePage />}
          {page === "jadwal" && <SchedulePage />}
          {page === "tugas" && <TasksPage />}
        </div>
      </main>
    </div>
  );
}
