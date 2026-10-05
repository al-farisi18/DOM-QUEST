/* =====================================================
   PERPUSTAKAAN DOM
   1.  querySelector & querySelectorAll
   2.  innerHTML, textContent, innerText
   3.  Manipulasi atribut & style
   4.  Membuat & menghapus elemen
   5.  Event listener: click, input, submit
   6.  Event bubbling & stopPropagation
   7.  Event delegation
   8.  Ambil data & validasi
   9.  DOM traversal: parent & children
   10. Render buku + tombol aksi
   ===================================================== */

// ---------- Data (sumber kebenaran) ----------
let dataBuku = [
  { id: 1, judul: "Laskar Pelangi",  penulis: "Andrea Hirata",         tahun: 2005, status: "tersedia", sorot: false },
  { id: 2, judul: "Bumi Manusia",    penulis: "Pramoedya Ananta Toer", tahun: 1980, status: "tersedia", sorot: false },
  { id: 3, judul: "Negeri 5 Menara", penulis: "Ahmad Fuadi",           tahun: 2009, status: "tersedia", sorot: false },
];
let idBerikut = 4;

// ---------- 1. querySelector & querySelectorAll ----------
const daftarBuku  = document.querySelector("#daftar-buku");
const formBuku    = document.querySelector("#form-buku");
const inputCari   = document.querySelector("#cari");
const hasilCari   = document.querySelector("#hasil-cari");
const statistik   = document.querySelector("#statistik");
const pesanKosong = document.querySelector("#kosong");
const infoDom     = document.querySelector("#info-dom");
const log         = document.querySelector("#log");
const info        = document.querySelector(".info");

// NodeList bersifat statis, jadi dipanggil ulang setiap kali dibutuhkan.
const semuaBuku = () => document.querySelectorAll(".buku");

// ---------- 2. innerHTML, textContent, innerText ----------
// innerHTML hanya untuk teks tetap buatan kita sendiri (aman).
info.innerHTML = "Selamat datang di <strong>Perpustakaan Digital</strong>!";
// Data dari pengguna selalu lewat textContent agar tidak ada risiko XSS.
// (innerText hanya membaca teks yang terlihat; textContent membaca semuanya.
//  Coba di Console: daftarBuku.innerText vs daftarBuku.textContent setelah mencari.)

function perbaruiStatistik() {
  const total = dataBuku.length;
  const dipinjam = dataBuku.filter((b) => b.status === "dipinjam").length;
  statistik.textContent =
    `Total ${total} buku, ${total - dipinjam} tersedia, ${dipinjam} dipinjam`;
  pesanKosong.hidden = total !== 0;
}

function catat(pesan) {
  const item = document.createElement("li");
  item.textContent = `${new Date().toLocaleTimeString("id-ID")} - ${pesan}`;
  log.prepend(item);
  while (log.children.length > 8) log.lastElementChild.remove();
}

// ---------- 4 & 10. Membuat elemen + tombol aksi ----------
function buatTombol(aksi, label, aria) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = label;
  btn.dataset.aksi = aksi;           // dibaca oleh event delegation
  if (aria) btn.setAttribute("aria-label", aria);
  if (aksi === "hapus") btn.classList.add("btn-hapus");
  return btn;
}

function buatBuku(item) {
  const li = document.createElement("li");
  li.className = "buku";
  li.dataset.id = item.id;
  li.dataset.status = item.status;                       // 3. atribut data-*
  li.classList.toggle("dipinjam", item.status === "dipinjam"); // 3. class
  li.classList.toggle("sorot", item.sorot);

  const teks = document.createElement("div");
  teks.className = "teks";

  const spanJudul = document.createElement("span");
  spanJudul.className = "judul";
  spanJudul.textContent = item.judul;

  const spanPenulis = document.createElement("span");
  spanPenulis.className = "penulis";
  spanPenulis.textContent = `${item.penulis}, ${item.tahun}`;

  teks.append(spanJudul, spanPenulis);

  const badge = document.createElement("span");
  badge.className = "status";
  badge.textContent = item.status;

  const aksi = document.createElement("div");
  aksi.className = "aksi";
  aksi.append(
    buatTombol("toggle", item.status === "tersedia" ? "Pinjam" : "Kembalikan"),
    buatTombol("detail", "Detail"),
    buatTombol("naik", "↑", "Pindah ke atas"),
    buatTombol("turun", "↓", "Pindah ke bawah"),
    buatTombol("hapus", "Hapus")
  );

  li.append(teks, badge, aksi);
  return li;
}

// ---------- 10. Render buku dari data ----------
function renderBuku() {
  daftarBuku.replaceChildren();                       // kosongkan daftar
  dataBuku.forEach((item) => daftarBuku.append(buatBuku(item)));
  terapkanFilter();
  perbaruiStatistik();
}

// ---------- 5. input: pencarian real-time ----------
function terapkanFilter() {
  const kata = inputCari.value.trim().toLowerCase();
  let ditemukan = 0;

  semuaBuku().forEach((buku) => {
    const judul = buku.querySelector(".judul").textContent.toLowerCase();
    const cocok = judul.includes(kata);
    buku.style.display = cocok ? "" : "none";          // 3. style inline
    if (cocok) ditemukan++;
  });

  hasilCari.textContent = kata ? `${ditemukan} buku ditemukan` : "";
}
inputCari.addEventListener("input", terapkanFilter);

// ---------- 8. Ambil data & validasi ----------
function tampilError(nama, pesan) {
  const input = formBuku.elements[nama];
  const el = document.querySelector(`#err-${nama}`);
  el.textContent = pesan;
  if (pesan) input.setAttribute("aria-invalid", "true");
  else input.removeAttribute("aria-invalid");
}

function validasi({ judul, penulis, tahun }) {
  const galat = {};
  const tahunIni = new Date().getFullYear();

  if (!judul) galat.judul = "Judul wajib diisi.";
  else if (judul.length < 3) galat.judul = "Judul minimal 3 karakter.";
  else if (dataBuku.some((b) => b.judul.toLowerCase() === judul.toLowerCase()))
    galat.judul = "Buku dengan judul ini sudah ada.";

  if (!penulis) galat.penulis = "Nama penulis wajib diisi.";
  else if (!/^[\p{L}\s.'-]+$/u.test(penulis))
    galat.penulis = "Nama penulis hanya boleh berisi huruf.";

  if (Number.isNaN(tahun)) galat.tahun = "Tahun wajib diisi.";
  else if (!Number.isInteger(tahun) || tahun < 1900 || tahun > tahunIni)
    galat.tahun = `Tahun harus antara 1900 dan ${tahunIni}.`;

  return galat;
}

// Hapus pesan error otomatis saat pengguna mulai memperbaiki isian
formBuku.addEventListener("input", (e) => {
  if (e.target.name) tampilError(e.target.name, "");
});

// ---------- 5. submit ----------
formBuku.addEventListener("submit", (e) => {
  e.preventDefault();                                   // cegah reload

  // Ambil semua isian form sekaligus
  const mentah = Object.fromEntries(new FormData(formBuku));
  const nilai = {
    judul: mentah.judul.trim(),
    penulis: mentah.penulis.trim(),
    tahun: mentah.tahun.trim() === "" ? NaN : Number(mentah.tahun),
  };

  const galat = validasi(nilai);
  ["judul", "penulis", "tahun"].forEach((n) => tampilError(n, galat[n] || ""));

  const pertama = Object.keys(galat)[0];
  if (pertama) {                                         // ada error: berhenti
    formBuku.elements[pertama].focus();
    return;
  }

  dataBuku.push({ id: idBerikut++, ...nilai, status: "tersedia", sorot: false });
  formBuku.reset();
  formBuku.elements.judul.focus();
  renderBuku();
  catat(`Menambah buku "${nilai.judul}"`);
});

// ---------- 9. DOM traversal: parent & children ----------
function tampilkanInfoDOM(buku, tombol) {
  const induk = buku.parentElement;
  const urutan = Array.from(induk.children).indexOf(buku);
  const sebelum = buku.previousElementSibling;
  const sesudah = buku.nextElementSibling;
  const judulDari = (li) =>
    li ? li.querySelector(".judul").textContent : "(tidak ada)";

  const baris = [
    `Induk dari <li>: <${induk.tagName.toLowerCase()} id="${induk.id}">`,
    `Posisi di antara saudara: ke-${urutan + 1} dari ${induk.children.length}`,
    `Anak langsung <li> (${buku.children.length}): ` +
      Array.from(buku.children).map((c) => c.className).join(", "),
    `Anak pertama: .${buku.firstElementChild.className}, anak terakhir: .${buku.lastElementChild.className}`,
    `Saudara sebelumnya: ${judulDari(sebelum)}`,
    `Saudara sesudahnya: ${judulDari(sesudah)}`,
    `Induk tombol yang diklik: .${tombol.parentElement.className}`,
    `Leluhur terdekat berkelas .buku: ${tombol.closest(".buku") === buku ? "ditemukan (closest)" : "-"}`,
  ];

  infoDom.replaceChildren(
    ...baris.map((teks) => {
      const li = document.createElement("li");
      li.textContent = teks;
      return li;
    })
  );
}

// ---------- 7 & 6 & 10. Event delegation + bubbling + tombol aksi ----------
// Satu listener di <ul> untuk semua buku, termasuk yang dibuat belakangan.
daftarBuku.addEventListener("click", (e) => {
  const tombol = e.target.closest("button[data-aksi]");
  const buku = e.target.closest(".buku");
  if (!buku) return;

  const id = Number(buku.dataset.id);
  const item = dataBuku.find((b) => b.id === id);

  // Klik di luar tombol: sorot baris (event dibiarkan naik/bubbling)
  if (!tombol) {
    item.sorot = !item.sorot;
    buku.classList.toggle("sorot", item.sorot);
    return;
  }

  e.stopPropagation(); // 6. klik tombol tidak naik ke body

  switch (tombol.dataset.aksi) {
    case "toggle":
      item.status = item.status === "tersedia" ? "dipinjam" : "tersedia";
      catat(`${item.status === "dipinjam" ? "Meminjam" : "Mengembalikan"} "${item.judul}"`);
      renderBuku();
      break;

    case "detail":
      tampilkanInfoDOM(buku, tombol);
      break;

    case "naik":
    case "turun": {
      // 9. Cari tetangga lewat traversal, lalu tukar posisi di data
      const tetangga = tombol.dataset.aksi === "naik"
        ? buku.previousElementSibling
        : buku.nextElementSibling;
      if (!tetangga) {
        catat(`"${item.judul}" sudah di posisi paling ${tombol.dataset.aksi === "naik" ? "atas" : "bawah"}`);
        break;
      }
      const a = dataBuku.findIndex((b) => b.id === id);
      const b = dataBuku.findIndex((x) => x.id === Number(tetangga.dataset.id));
      [dataBuku[a], dataBuku[b]] = [dataBuku[b], dataBuku[a]];
      renderBuku();
      break;
    }

    case "hapus":
      dataBuku = dataBuku.filter((b) => b.id !== id);
      renderBuku();
      catat(`Menghapus "${item.judul}"`);
      break;
  }
});

// ---------- 6. Demonstrasi bubbling ----------
// Klik pada tombol tidak sampai ke sini (dihentikan stopPropagation).
// Klik pada bagian lain baris buku akan tercatat di Console.
document.body.addEventListener("click", (e) => {
  if (e.target.closest(".buku")) {
    console.log("Bubbling sampai body dari:", e.target.tagName);
  }
});

// Tampilan awal
renderBuku();