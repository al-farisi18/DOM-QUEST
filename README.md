# DOM-QUEST
# Belajar DOM dengan Studi Kasus Perpustakaan

Repository ini berisi latihan **DOM (Document Object Model)** JavaScript dalam bentuk aplikasi perpustakaan sederhana. Pengguna bisa menambah buku, mencari judul, meminjam, mengembalikan, mengurutkan ulang, dan menghapus buku.

## Daftar Isi

1. [querySelector dan querySelectorAll](#1-queryselector-dan-queryselectorall)
2. [innerHTML, textContent, innerText](#2-innerhtml-textcontent-innertext)
3. [Manipulasi Atribut dan Style](#3-manipulasi-atribut-dan-style)
4. [Membuat dan Menghapus Elemen](#4-membuat-dan-menghapus-elemen)
5. [Event Listener: click, input, submit](#5-event-listener-click-input-submit)
6. [Event Bubbling dan stopPropagation](#6-event-bubbling-dan-stoppropagation)
7. [Event Delegation](#7-event-delegation)
8. [Ambil Data dan Validasi](#8-ambil-data-dan-validasi)
9. [DOM Traversal: Parent dan Children](#9-dom-traversal-parent-dan-children)
10. [Render Buku dan Tombol Aksi](#10-render-buku-dan-tombol-aksi)
11. [Ringkasan](#ringkasan)

## Struktur Project

```
DOM/
├── README.md
└── perpustakaan/
    ├── index.html   # kerangka halaman
    ├── style.css    # tampilan
    └── script.js    # logika DOM (10 topik)
```

## Cara Menjalankan

1. Clone repository: `git clone https://github.com/<username>/DOM.git`
2. Buka folder `perpustakaan`.
3. Buka `index.html` di browser (klik dua kali, atau gunakan Live Server di VS Code).

---

## 1. querySelector dan querySelectorAll

### Pengertian
- `querySelector(selector)` mengambil **satu** elemen pertama yang cocok dengan selector CSS.
- `querySelectorAll(selector)` mengambil **semua** elemen yang cocok, hasilnya berupa `NodeList`.

### Cara Kerja
Browser menelusuri pohon DOM dari atas ke bawah dan mencocokkan elemen dengan selector CSS (`#id`, `.class`, `tag`, `[atribut]`).
- `querySelector` berhenti di kecocokan pertama dan mengembalikan `null` jika tidak ada.
- `querySelectorAll` mengembalikan `NodeList` **statis**, yaitu salinan hasil pada saat dipanggil. Elemen yang ditambahkan sesudahnya tidak ikut masuk, jadi harus dipanggil ulang.
- `NodeList` bisa di-loop dengan `forEach`.

### Implementasi

```js
// Satu elemen
const daftarBuku = document.querySelector("#daftar-buku");
const formBuku   = document.querySelector("#form-buku");
const inputCari  = document.querySelector("#cari");

// Banyak elemen: dibungkus fungsi agar selalu mengambil data terbaru
const semuaBuku = () => document.querySelectorAll(".buku");

semuaBuku().forEach((buku) => {
  const judul = buku.querySelector(".judul").textContent;
  console.log(judul);
});
```

Selector juga bisa memakai atribut, misalnya `document.querySelectorAll('.buku[data-status="dipinjam"]')`.

---

## 2. innerHTML, textContent, innerText

### Pengertian

| Properti | Fungsi |
|---|---|
| `innerHTML` | Membaca atau menulis isi elemen **sebagai HTML** |
| `textContent` | Membaca atau menulis **semua teks mentah** dalam elemen |
| `innerText` | Membaca atau menulis **teks yang terlihat**, sesuai CSS |

### Cara Kerja
- `innerHTML` mem-parsing string menjadi elemen DOM. Tag HTML dirender, sehingga **berisiko XSS** jika berisi input pengguna.
- `textContent` memperlakukan semuanya sebagai teks biasa, jadi aman dan cepat. Teks pada elemen tersembunyi (`display: none`) tetap terbaca.
- `innerText` memperhatikan CSS, sehingga elemen tersembunyi tidak ikut terbaca. Karena itu ia memicu *reflow* dan sedikit lebih lambat.

### Implementasi

```js
const info = document.querySelector(".info");

// innerHTML: hanya untuk teks tetap buatan sendiri
info.innerHTML = "Selamat datang di <strong>Perpustakaan Digital</strong>!";

// textContent: untuk data dari pengguna (aman dari XSS)
info.textContent = "Selamat datang di <strong>Perpustakaan</strong>!"; // tag tampil apa adanya

// Perbedaan textContent vs innerText (coba di Console setelah mencari buku)
console.log(daftarBuku.textContent); // termasuk buku yang disembunyikan filter
console.log(daftarBuku.innerText);   // hanya buku yang terlihat
```

**Contoh bahaya `innerHTML`:**

```js
const inputBerbahaya = '<img src=x onerror="alert(\'XSS\')">';
// info.innerHTML = inputBerbahaya;  // JANGAN: kode berbahaya bisa berjalan
info.textContent = inputBerbahaya;   // aman: hanya tampil sebagai teks
```

**Aturan praktis:** data dari pengguna selalu pakai `textContent`.

---

## 3. Manipulasi Atribut dan Style

### Pengertian
Mengubah atribut HTML (`id`, `class`, `data-*`, `disabled`, dan lain-lain) serta tampilan elemen lewat JavaScript.

### Cara Kerja
- **Atribut:** `getAttribute`, `setAttribute`, `removeAttribute`, `hasAttribute`. Atribut `data-*` diakses lewat `dataset`.
- **Class:** `classList.add / remove / toggle / contains`.
- **Style:** `element.style.property` menulis *inline style*. Properti ditulis camelCase, misalnya `backgroundColor`.

### Implementasi

```js
const li = document.createElement("li");

// Atribut data-*
li.dataset.id = 1;                    // <li data-id="1">
li.dataset.status = "tersedia";

// Atribut umum
li.setAttribute("data-status", "dipinjam");
console.log(li.getAttribute("data-status")); // "dipinjam"

// Class
li.className = "buku";
li.classList.toggle("dipinjam", true);   // tambah class jika kondisi true
li.classList.toggle("sorot", false);     // hapus class jika kondisi false

// Style inline (dipakai pada pencarian)
li.style.display = "none";   // sembunyikan
li.style.display = "";       // kembalikan ke bawaan CSS

// Atribut aksesibilitas
input.setAttribute("aria-invalid", "true");
input.removeAttribute("aria-invalid");
```

Class lebih disarankan daripada style inline untuk tampilan tetap, agar CSS tetap terpusat di `style.css`:

```css
.dipinjam { background: #fdecea; }
.dipinjam .judul { text-decoration: line-through; }
.sorot { border-left: 4px solid #e8a838; }
```

---

## 4. Membuat dan Menghapus Elemen

### Pengertian
Menambah elemen baru ke halaman secara dinamis dan menghapus elemen yang sudah ada.

### Cara Kerja
1. `document.createElement("tag")` membuat elemen di memori. Elemen belum tampil.
2. Teks dan atributnya diatur.
3. Elemen dipasang ke DOM agar muncul di halaman: `appendChild`, `append`, `prepend`, `insertBefore`, atau `insertAdjacentElement`.
4. `el.remove()` menghapus elemen itu sendiri. `parent.replaceChildren()` mengosongkan seluruh isi induk.

### Implementasi

```js
function buatTombol(aksi, label, aria) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = label;
  btn.dataset.aksi = aksi;
  if (aria) btn.setAttribute("aria-label", aria);
  if (aksi === "hapus") btn.classList.add("btn-hapus");
  return btn;
}

function buatBuku(item) {
  const li = document.createElement("li");
  li.className = "buku";
  li.dataset.id = item.id;

  const spanJudul = document.createElement("span");
  spanJudul.className = "judul";
  spanJudul.textContent = item.judul;      // aman dari XSS

  const spanPenulis = document.createElement("span");
  spanPenulis.className = "penulis";
  spanPenulis.textContent = `${item.penulis}, ${item.tahun}`;

  li.append(spanJudul, spanPenulis);       // append bisa menerima banyak argumen
  return li;
}

daftarBuku.append(buatBuku(item));         // tambah di akhir
log.prepend(itemLog);                      // tambah di awal
buku.remove();                             // hapus satu elemen
daftarBuku.replaceChildren();              // kosongkan seluruh daftar
```

---

## 5. Event Listener: click, input, submit

### Pengertian
Event listener adalah fungsi yang dijalankan ketika suatu kejadian terjadi, misalnya klik, mengetik, atau pengiriman form.

### Cara Kerja
`element.addEventListener("jenis-event", fungsi)` mendaftarkan fungsi ke elemen. Saat event terjadi, browser membuat **objek event** (`e`) berisi informasi seperti `e.target` dan `e.type`, lalu memanggil fungsi tersebut.

| Event | Terjadi ketika |
|---|---|
| `click` | Pengguna mengklik elemen |
| `input` | Nilai input berubah setiap kali pengguna mengetik |
| `submit` | Form dikirim. Gunakan `e.preventDefault()` agar halaman tidak reload |

### Implementasi

```js
// INPUT: pencarian buku secara real-time
function terapkanFilter() {
  const kata = inputCari.value.trim().toLowerCase();
  let ditemukan = 0;

  semuaBuku().forEach((buku) => {
    const judul = buku.querySelector(".judul").textContent.toLowerCase();
    const cocok = judul.includes(kata);
    buku.style.display = cocok ? "" : "none";
    if (cocok) ditemukan++;
  });

  hasilCari.textContent = kata ? `${ditemukan} buku ditemukan` : "";
}
inputCari.addEventListener("input", terapkanFilter);

// SUBMIT: tambah buku dari form
formBuku.addEventListener("submit", (e) => {
  e.preventDefault();   // cegah reload halaman
  // ... ambil data, validasi, tambah buku (lihat topik 8)
});

// CLICK: lihat topik 7 (event delegation)
```

---

## 6. Event Bubbling dan stopPropagation

### Pengertian
- **Event bubbling:** event yang terjadi pada elemen anak akan **naik** ke elemen induknya, lalu ke induk berikutnya sampai `document`.
- **`stopPropagation()`:** menghentikan perambatan event agar tidak naik ke induk.

### Cara Kerja
Jika tombol di dalam `<li>` di dalam `<ul>` diklik, listener berjalan berurutan dari `button` → `li` → `ul` → `body` → `document`.
- `e.target` adalah elemen yang benar-benar diklik.
- `e.currentTarget` adalah elemen tempat listener dipasang.

### Implementasi

```js
// Demonstrasi bubbling: listener di body menerima klik yang naik
document.body.addEventListener("click", (e) => {
  if (e.target.closest(".buku")) {
    console.log("Bubbling sampai body dari:", e.target.tagName);
  }
});

// Di listener <ul>: klik tombol dihentikan agar tidak naik ke body
daftarBuku.addEventListener("click", (e) => {
  const tombol = e.target.closest("button[data-aksi]");
  if (tombol) {
    e.stopPropagation();   // klik tombol tidak sampai ke body
    // ... jalankan aksi
  }
});
```

**Cara mencoba:** buka Console (F12). Klik teks judul buku, pesan dari `body` muncul. Klik tombol Pinjam atau Hapus, pesan itu tidak muncul.

**Catatan:** `stopPropagation()` sebaiknya dipakai seperlunya karena dapat mengganggu listener lain yang bergantung pada bubbling.

---

## 7. Event Delegation

### Pengertian
Memasang **satu listener di elemen induk** untuk menangani event dari banyak elemen anak.

### Cara Kerja
Event pada anak naik (bubbling) ke induk. Di induk, `e.target.closest(...)` dipakai untuk mengetahui anak mana yang diklik. Keuntungannya:
- Hanya satu listener, sehingga hemat memori.
- Elemen yang ditambahkan **belakangan** otomatis tertangani tanpa perlu `addEventListener` baru.
- Kode lebih ringkas dan terpusat.

### Implementasi
Setiap tombol diberi atribut `data-aksi`, lalu satu listener di `<ul>` membaca atribut itu:

```js
daftarBuku.addEventListener("click", (e) => {
  const tombol = e.target.closest("button[data-aksi]");
  const buku = e.target.closest(".buku");
  if (!buku) return;

  const id = Number(buku.dataset.id);
  const item = dataBuku.find((b) => b.id === id);

  // Klik di luar tombol: sorot baris
  if (!tombol) {
    item.sorot = !item.sorot;
    buku.classList.toggle("sorot", item.sorot);
    return;
  }

  e.stopPropagation();

  switch (tombol.dataset.aksi) {
    case "toggle":
      item.status = item.status === "tersedia" ? "dipinjam" : "tersedia";
      renderBuku();
      break;
    case "detail":
      tampilkanInfoDOM(buku, tombol);
      break;
    case "hapus":
      dataBuku = dataBuku.filter((b) => b.id !== id);
      renderBuku();
      break;
  }
});
```

**Mengapa `closest()`?** Jika tombol berisi elemen lain (misalnya ikon), `e.target` bisa berupa ikon itu. `closest()` memastikan kita tetap mendapatkan tombolnya.

---

## 8. Ambil Data dan Validasi

### Pengertian
Membaca isian pengguna dari form, lalu memeriksa kebenarannya sebelum diproses.

### Cara Kerja
1. `new FormData(form)` mengambil semua isian yang punya atribut `name`. `Object.fromEntries()` mengubahnya menjadi objek biasa.
2. Nilai dibersihkan: `.trim()` untuk spasi, `Number()` untuk angka.
3. Fungsi `validasi()` memeriksa setiap aturan dan mengembalikan objek berisi pesan galat.
4. Pesan galat ditampilkan di bawah input dengan `textContent`, dan input diberi `aria-invalid="true"`.
5. Jika ada galat, proses dihentikan dan fokus dipindah ke isian pertama yang salah.

Form memakai atribut `novalidate` agar validasi bawaan browser dimatikan dan kita mengendalikan pesannya sendiri.

### Implementasi

```js
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

function tampilError(nama, pesan) {
  const input = formBuku.elements[nama];
  const el = document.querySelector(`#err-${nama}`);
  el.textContent = pesan;
  if (pesan) input.setAttribute("aria-invalid", "true");
  else input.removeAttribute("aria-invalid");
}

formBuku.addEventListener("submit", (e) => {
  e.preventDefault();

  const mentah = Object.fromEntries(new FormData(formBuku));
  const nilai = {
    judul: mentah.judul.trim(),
    penulis: mentah.penulis.trim(),
    tahun: mentah.tahun.trim() === "" ? NaN : Number(mentah.tahun),
  };

  const galat = validasi(nilai);
  ["judul", "penulis", "tahun"].forEach((n) => tampilError(n, galat[n] || ""));

  const pertama = Object.keys(galat)[0];
  if (pertama) {
    formBuku.elements[pertama].focus();
    return;                       // berhenti jika ada galat
  }

  dataBuku.push({ id: idBerikut++, ...nilai, status: "tersedia", sorot: false });
  formBuku.reset();
  renderBuku();
});

// Pesan galat hilang saat pengguna mulai memperbaiki isian
formBuku.addEventListener("input", (e) => {
  if (e.target.name) tampilError(e.target.name, "");
});
```

**Penting:** validasi di sisi browser hanya untuk kenyamanan pengguna. Pada aplikasi sungguhan, data tetap harus divalidasi ulang di server.

---

## 9. DOM Traversal: Parent dan Children

### Pengertian
Berpindah dari satu elemen ke elemen lain yang berhubungan di pohon DOM, tanpa harus memanggil `querySelector` dari `document` lagi.

### Cara Kerja
Setiap elemen punya hubungan dengan elemen lain:

| Properti / Method | Hasil |
|---|---|
| `parentElement` | Induk langsung |
| `closest(selector)` | Leluhur terdekat (termasuk dirinya) yang cocok dengan selector |
| `children` | Daftar anak langsung (hanya elemen) |
| `firstElementChild` / `lastElementChild` | Anak pertama / terakhir |
| `previousElementSibling` / `nextElementSibling` | Saudara sebelum / sesudah |

Gunakan versi `...Element...` (bukan `childNodes`, `nextSibling`) karena versi tersebut mengabaikan teks dan spasi kosong antar-tag.

Struktur satu buku di project ini:

```
ul#daftar-buku
└── li.buku
    ├── div.teks
    │   ├── span.judul
    │   └── span.penulis
    ├── span.status
    └── div.aksi
        └── button (Pinjam, Detail, ↑, ↓, Hapus)
```

### Implementasi

```js
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
  ];

  infoDom.replaceChildren(
    ...baris.map((teks) => {
      const li = document.createElement("li");
      li.textContent = teks;
      return li;
    })
  );
}
```

Traversal juga dipakai untuk tombol **↑ dan ↓**. Tetangga dicari lewat `previousElementSibling` atau `nextElementSibling`, lalu posisinya ditukar di data:

```js
const tetangga = tombol.dataset.aksi === "naik"
  ? buku.previousElementSibling
  : buku.nextElementSibling;
if (!tetangga) break;   // sudah di ujung daftar

const a = dataBuku.findIndex((b) => b.id === id);
const b = dataBuku.findIndex((x) => x.id === Number(tetangga.dataset.id));
[dataBuku[a], dataBuku[b]] = [dataBuku[b], dataBuku[a]];
renderBuku();
```

---

## 10. Render Buku dan Tombol Aksi

### Pengertian
Menampilkan daftar buku dari **data (array)**, bukan menulis HTML secara manual. Setiap buku disertai tombol aksi.

### Cara Kerja
1. Array `dataBuku` menjadi **sumber kebenaran** (single source of truth).
2. `renderBuku()` mengosongkan `<ul>` dengan `replaceChildren()`.
3. Untuk setiap objek buku, `buatBuku()` membuat `<li>` lengkap dengan tombol aksi, lalu dipasang ke `<ul>`.
4. Setiap perubahan (pinjam, kembalikan, hapus, urut ulang, tambah) cukup **mengubah data lalu memanggil `renderBuku()`**, sehingga tampilan selalu sinkron dengan data.
5. Tombol hanya membawa `data-aksi`. Logikanya ditangani oleh event delegation (topik 7).

### Implementasi

```js
// Sumber data
let dataBuku = [
  { id: 1, judul: "Laskar Pelangi", penulis: "Andrea Hirata",
    tahun: 2005, status: "tersedia", sorot: false },
  { id: 2, judul: "Bumi Manusia", penulis: "Pramoedya Ananta Toer",
    tahun: 1980, status: "tersedia", sorot: false },
];
let idBerikut = 3;

// Render
function renderBuku() {
  daftarBuku.replaceChildren();
  dataBuku.forEach((item) => daftarBuku.append(buatBuku(item)));
  terapkanFilter();       // pertahankan hasil pencarian yang aktif
  perbaruiStatistik();
}

// Tombol aksi di dalam buatBuku()
aksi.append(
  buatTombol("toggle", item.status === "tersedia" ? "Pinjam" : "Kembalikan"),
  buatTombol("detail", "Detail"),
  buatTombol("naik", "↑", "Pindah ke atas"),
  buatTombol("turun", "↓", "Pindah ke bawah"),
  buatTombol("hapus", "Hapus")
);

// Statistik dihitung dari data
function perbaruiStatistik() {
  const total = dataBuku.length;
  const dipinjam = dataBuku.filter((b) => b.status === "dipinjam").length;
  statistik.textContent =
    `Total ${total} buku, ${total - dipinjam} tersedia, ${dipinjam} dipinjam`;
  pesanKosong.hidden = total !== 0;
}
```

**Catatan:** me-render ulang seluruh daftar cukup untuk skala kecil seperti ini. Untuk daftar yang sangat besar, update elemen secara selektif akan lebih efisien.

---

## Ringkasan

| No | Topik | Fungsi di aplikasi perpustakaan |
|---|---|---|
| 1 | querySelector / querySelectorAll | Mengambil form, input, daftar, dan semua buku |
| 2 | innerHTML / textContent / innerText | Teks sambutan, statistik, dan data buku yang aman |
| 3 | Atribut dan style | Status buku (`data-status`), class `dipinjam` dan `sorot`, sembunyikan saat pencarian |
| 4 | Membuat dan menghapus elemen | `buatBuku()`, `buatTombol()`, `remove()`, `replaceChildren()` |
| 5 | click / input / submit | Pencarian real-time, tambah buku, klik tombol |
| 6 | Bubbling dan stopPropagation | Klik tombol tidak ikut menyorot baris atau naik ke body |
| 7 | Event delegation | Satu listener di `<ul>` untuk semua tombol aksi |
| 8 | Ambil data dan validasi | `FormData`, pesan galat per kolom, cegah judul kembar |
| 9 | DOM traversal | Panel Info DOM, tombol ↑ dan ↓ |
| 10 | Render buku dan tombol aksi | `renderBuku()` dari array `dataBuku` |

## Alur Git per Topik

Satu commit per topik membuat riwayat belajar terlihat jelas:

```bash
git add .
git commit -m "feat: querySelector dan querySelectorAll"
git commit -m "feat: innerHTML, textContent, innerText"
git commit -m "feat: atribut dan style"
git commit -m "feat: membuat dan menghapus elemen"
git commit -m "feat: event listener click, input, submit"
git commit -m "feat: event bubbling dan stopPropagation"
git commit -m "feat: event delegation"
git commit -m "feat: ambil data dan validasi form"
git commit -m "feat: DOM traversal parent dan children"
git commit -m "feat: render buku dan tombol aksi"
git push origin main
```