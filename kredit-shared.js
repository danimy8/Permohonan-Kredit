/**
 * kredit-shared.js
 * Muat SETELAH kredit-print.js, di form.html DAN dashboard.html.
 *
 * Aturan emas: semua cetakan (review form, cetak dashboard) WAJIB lewat kRender().
 * Jangan panggil buildKreditPrint() langsung dari tempat lain.
 */

const K_DATE_FIELDS = ['Tanggal Lahir', 'Tanggal Pengajuan'];

/** Ubah data apa pun (isian form / baris Sheet) menjadi bentuk baku yang sama. Aman dipanggil berulang. */
function kNormalize(src) {
  const r = {};
  Object.keys(src || {}).forEach(k => {
    const v = src[k];
    r[k] = v == null ? '' : (typeof v === 'string' ? v : String(v)).trim();
  });

  // Tanggal: jika Sheet mengirim format ISO (2000-02-05T17:00:00.000Z), kembalikan ke yyyy-mm-dd lokal
  K_DATE_FIELDS.forEach(k => {
    if (/^\d{4}-\d{2}-\d{2}T/.test(r[k])) {
      const d = new Date(r[k]);
      if (!isNaN(d)) {
        const p = n => String(n).padStart(2, '0');
        r[k] = d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
      }
    }
  });

  // Nilai kosong untuk "Lainnya" selalu '-'
  if (!r['Nama Dokumen Lainnya']) r['Nama Dokumen Lainnya'] = '-';
  return r;
}

/**
 * Satu-satunya pintu render cetakan.
 * @param record  data mentah (form atau Sheet)
 * @param images  { ktp, ttd, ttd2 } berupa data URL
 * @param flag    argumen ke-3 buildKreditPrint (form: false, dashboard: true)
 */
function kRender(record, images, flag) {
  return buildKreditPrint(kNormalize(record), images || {}, !!flag);
}

/** Ambil gambar dengan 3x percobaan; kembalikan { img, failed } agar kegagalan tidak diam-diam. */
async function kLoadImages(r, getFile, fileIdOf) {
  const cols = { ktp: 'Foto KTP', ttd: 'Tanda Tangan', ttd2: 'Tanda Tangan 2' };
  const img = {}, failed = [];
  await Promise.all(Object.entries(cols).map(async ([key, col]) => {
    img[key] = '';
    if (!fileIdOf(r, col)) return;               // memang tidak ada berkas
    for (let t = 0; t < 3; t++) {
      try { img[key] = await getFile(r, col); return; }
      catch (e) { await new Promise(res => setTimeout(res, 400 * (t + 1))); }
    }
    failed.push(col);
  }));
  return { img, failed };
}
