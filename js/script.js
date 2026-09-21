// Mengambil elemen HTML yang akan digunakan
const hasilElement = document.getElementById("hasil");
const riwayatElement = document.getElementById("riwayat");
const tombolContainer = document.getElementById("tombol-kalkulator");

// State: data yang menyimpan kondisi kalkulator
let angkaSekarang = "0";
let angkaPertama = null;
let operator = null;
let inputBaru = false;
let terjadiError = false;

// Simbol operator untuk ditampilkan pada riwayat
const simbolOperator = {
  "+": "➕",
  "-": "➖",
  "*": "✖",
  "/": "➗"
};

// Menampilkan angka ke layar kalkulator
function tampilkanHasil() {
  hasilElement.textContent = angkaSekarang;
}

// Mereset kalkulator ke kondisi awal
function resetKalkulator() {
  angkaSekarang = "0";
  angkaPertama = null;
  operator = null;
  inputBaru = false;
  terjadiError = false;

  riwayatElement.textContent = "";
  tampilkanHasil();
}

// Menampilkan pesan error
function tampilkanError(pesan) {
  angkaSekarang = "Error";
  angkaPertama = null;
  operator = null;
  inputBaru = true;
  terjadiError = true;

  riwayatElement.textContent = pesan;
  tampilkanHasil();
}

// Menambahkan angka atau titik desimal
function tambahAngka(angka) {
  // Jika sebelumnya terjadi error,
  // mulai kembali dari kondisi awal
  if (terjadiError) {
    resetKalkulator();
  }

  // Jika sedang memasukkan angka baru setelah operator
  // atau setelah mendapatkan hasil perhitungan
  if (inputBaru) {
    angkaSekarang = "0";
    inputBaru = false;
  }

  // Menangani titik desimal
  if (angka === ".") {
    // Satu angka hanya boleh memiliki satu titik desimal
    if (!angkaSekarang.includes(".")) {
      angkaSekarang += ".";
    }

    tampilkanHasil();
    return;
  }

  // Membatasi jumlah digit menjadi maksimal 12
  const jumlahDigit = angkaSekarang
    .replace(/[^0-9]/g, "")
    .length;

  if (jumlahDigit >= 12) {
    return;
  }

  // Menghindari angka seperti 01 atau 05
  angkaSekarang =
    angkaSekarang === "0"
      ? angka
      : angkaSekarang + angka;

  tampilkanHasil();
}

// Menghapus satu angka dari kanan
function hapusAngka() {
  // Jika terjadi error, kembalikan kalkulator ke kondisi awal
  if (terjadiError) {
    resetKalkulator();
    return;
  }

  // Jangan menghapus jika sedang menunggu angka berikutnya
  if (inputBaru) {
    return;
  }

  angkaSekarang = angkaSekarang.slice(0, -1);

  // Jika semua angka terhapus, tampilkan 0
  if (angkaSekarang === "" || angkaSekarang === "-") {
    angkaSekarang = "0";
  }

  tampilkanHasil();
}

// Melakukan operasi matematika
function hitungOperasi(angkaA, angkaB, operasi) {
  switch (operasi) {
    case "+":
      return angkaA + angkaB;

    case "-":
      return angkaA - angkaB;

    case "*":
      return angkaA * angkaB;

    case "/":
      if (angkaB === 0) {
        throw new Error("Tidak dapat membagi dengan nol.");
      }

      return angkaA / angkaB;

    default:
      throw new Error("Operator tidak dikenali.");
  }
}

// Menghitung hasil perhitungan
function hitungHasil() {
  // Perhitungan membutuhkan angka pertama,
  // operator, dan angka kedua
  if (
    angkaPertama === null ||
    operator === null ||
    inputBaru ||
    terjadiError
  ) {
    return;
  }

  const angkaKedua = Number(angkaSekarang);

  try {
    // Melakukan operasi matematika
    const hasil = hitungOperasi(
      angkaPertama,
      angkaKedua,
      operator
    );

    // Memastikan hasil merupakan angka yang valid
    if (!Number.isFinite(hasil)) {
      throw new Error(
        "Hasil berada di luar batas perhitungan."
      );
    }

    // Menampilkan riwayat perhitungan
    riwayatElement.textContent =
      `${angkaPertama} ${simbolOperator[operator]} ${angkaKedua} =`;

    // Mengurangi masalah angka desimal panjang
    // seperti 0.30000000000000004
    angkaSekarang = String(
      Number(hasil.toPrecision(12))
    );

    // Mengembalikan state setelah perhitungan selesai
    angkaPertama = null;
    operator = null;
    inputBaru = true;

    tampilkanHasil();

  } catch (error) {
    tampilkanError(error.message);
  }
}

// Memilih operator matematika
function pilihOperator(operatorDipilih) {
  // Jika terjadi error, jangan lakukan operasi
  if (terjadiError) {
    return;
  }

  // Jika sudah ada operator dan angka kedua sudah dimasukkan,
  // selesaikan operasi sebelumnya terlebih dahulu
  if (operator !== null && !inputBaru) {
    hitungHasil();

    if (terjadiError) {
      return;
    }
  }

  // Menyimpan angka pertama dan operator
  angkaPertama = Number(angkaSekarang);
  operator = operatorDipilih;
  inputBaru = true;

  // Menampilkan operator pada riwayat
  riwayatElement.textContent =
    `${angkaPertama} ${simbolOperator[operator]}`;
}

// Event delegation:
// satu event listener digunakan untuk semua tombol kalkulator
tombolContainer.addEventListener("click", function (event) {
  const tombol = event.target.closest("button");

  // Pastikan yang diklik adalah tombol di dalam container
  if (!tombol || !tombolContainer.contains(tombol)) {
    return;
  }

  // Jika tombol memiliki data-angka
  if (tombol.dataset.angka !== undefined) {
    tambahAngka(tombol.dataset.angka);
    return;
  }

  // Jika tombol memiliki data-operator
  if (tombol.dataset.operator !== undefined) {
    pilihOperator(tombol.dataset.operator);
    return;
  }

  // Menangani tombol berdasarkan data-aksi
  switch (tombol.dataset.aksi) {
    case "reset":
      resetKalkulator();
      break;

    case "hapus":
      hapusAngka();
      break;

    case "hitung":
      hitungHasil();
      break;
  }
});