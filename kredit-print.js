/* =====================================================================
   kredit-print.js
   Satu sumber kebenaran untuk: daftar field, terbilang, dan cetakan
   Permohonan Kredit. Dipakai oleh form-kredit.html & dashboard-kredit.html.
   Nama field = nama kolom di Google Sheet.
   Format tiap field: [kolom, label, tipe, opsi, wajib, lebarPenuh]
   ===================================================================== */
const KREDIT_GROUPS = [
  { t: 'Pinjaman', f: [
    ['Pinjaman Diajukan', 'Pinjaman Diajukan (Rp)', 'rupiah', 0, 1],
    ['Terbilang', 'Terbilang', 'terbilang', 0, 0, 1],
    ['Jangka Waktu', 'Jangka Waktu (bulan)', 'number', 0, 1],
    ['Sanggup Mengangsur', 'Sanggup Mengangsur (Rp / bulan)', 'rupiah', 0, 1],
  ]},
  { t: 'Data Pemohon', f: [
    ['Nama Lengkap', 'Nama (sesuai KTP)', 'text', 0, 1],
    ['Nama Panggilan', 'Nama Panggilan', 'text'],
    ['Jenis Kelamin', 'Jenis Kelamin', 'select', ['Laki-laki', 'Perempuan'], 1],
    ['Tempat Lahir', 'Tempat Lahir', 'text', 0, 1],
    ['Tanggal Lahir', 'Tanggal Lahir', 'date', 0, 1],
    ['Pendidikan', 'Pendidikan Terakhir', 'select', ['SD', 'SMP', 'SMA/SMK', 'D1/D2/D3', 'D4/S1', 'S2', 'S3'], 1],
    ['Status Perkawinan', 'Status Perkawinan', 'select', ['Menikah', 'Belum Menikah', 'Janda', 'Duda'], 1],
    ['Nama Pasangan', 'Nama Istri / Suami', 'text'],
    ['Nama Ibu Kandung', 'Nama Ibu Kandung', 'text', 0, 1],
    ['Jumlah Tanggungan', 'Jumlah Tanggungan', 'number'],
  ]},
  { t: 'Tempat Tinggal', f: [
    ['Alamat', 'Alamat Saat Ini', 'textarea', 0, 1, 1],
    ['RT/RW', 'RT / RW', 'text'],
    ['Kelurahan/Desa', 'Kelurahan / Desa', 'text'],
    ['Kecamatan', 'Kecamatan', 'text'],
    ['Kota/Kabupaten', 'Kota / Kabupaten', 'text'],
    ['No. HP', 'No. HP', 'tel', 0, 1],
    ['Status Tempat Tinggal', 'Status Tempat Tinggal', 'select', ['Milik Sendiri', 'Sewa', 'Keluarga', 'Lainnya'], 1],
    ['Lama Menempati', 'Lama Menempati Rumah', 'text'],
    ['Alamat KTP', 'Alamat Sesuai KTP (jika berbeda)', 'textarea', 0, 0, 1],
  ]},
  { t: 'Keluarga / Kerabat yang Dapat Dihubungi (opsional)', f: [
    ['Kerabat Nama', 'Nama', 'text'],
    ['Kerabat No HP', 'No. HP', 'tel'],
    ['Kerabat Alamat', 'Alamat', 'textarea', 0, 0, 1],
    ['Kerabat Hubungan', 'Hubungan', 'text'],
  ]},
  { t: 'Penggunaan Pinjaman', f: [
    ['Tujuan Pinjaman', 'Pinjaman untuk', 'select', ['Modal Usaha', 'Investasi', 'Konsumtif', 'Lainnya'], 1],
    ['Usaha Utama', 'Usaha Utama', 'text'],
    ['Usaha Tambahan', 'Usaha Tambahan', 'text'],
    ['Mulai Usaha/Bekerja', 'Mulai Usaha / Bekerja (Tahun)', 'number'],
    ['NPWP', 'No. NPWP (jika ada)', 'text'],
    ['Pinjaman Bank Lain', 'Pinjaman Bank Lain', 'select', ['Ada', 'Tidak ada'], 1],
  ]},
  { t: 'Jaminan', f: [
    ['Jenis Jaminan', 'Jenis Jaminan', 'select', ['Sertifikat', 'BPKB', 'Deposito', 'Tabungan', 'Lainnya'], 1],
    ['Status Jaminan', 'Status Jaminan', 'select', ['Milik', 'Bukan milik'], 1],
    ['Jaminan Digunakan Oleh', 'Jaminan Digunakan Oleh', 'select', ['Sendiri', 'Orang lain'], 1],
    ['Hubungan Pemilik', 'Hubungan dengan Pemilik', 'select', ['Orang Tua', 'Anak', 'Lainnya']],
    ['Jumlah Jaminan', 'Jumlah Jaminan', 'text'],
    ['Nama Jaminan', 'Nama Jaminan', 'text'],
  ]},
  { t: 'Tanggal & Penandatangan', f: [
    ['Tanggal Pengajuan', 'Tanggal', 'date', 0, 1],
    ['Nama TTD 2', 'Nama Suami / Istri / Orang Tua (penanda tangan)', 'text', 0, 0, 1],
  ]},
];

const kEsc = v => String(v == null ? '' : v).replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* Angka -> kalimat, mis. 15000000 -> "Lima belas juta rupiah" */
function terbilang(n) {
  n = Math.floor(+n) || 0;
  const s = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
  const t = n => {
    if (n < 12) return s[n];
    if (n < 20) return t(n - 10) + ' belas';
    if (n < 100) return t(Math.floor(n / 10)) + ' puluh ' + t(n % 10);
    if (n < 200) return 'seratus ' + t(n - 100);
    if (n < 1000) return t(Math.floor(n / 100)) + ' ratus ' + t(n % 100);
    if (n < 2000) return 'seribu ' + t(n - 1000);
    if (n < 1e6) return t(Math.floor(n / 1e3)) + ' ribu ' + t(n % 1e3);
    if (n < 1e9) return t(Math.floor(n / 1e6)) + ' juta ' + t(n % 1e6);
    if (n < 1e12) return t(Math.floor(n / 1e9)) + ' miliar ' + t(n % 1e9);
    return t(Math.floor(n / 1e12)) + ' triliun ' + t(n % 1e12);
  };
  return n ? t(n).replace(/\s+/g, ' ').trim().replace(/^./, c => c.toUpperCase()) + ' rupiah' : '';
}

/* Cetakan 1 lembar A4 yang meniru formulir kertas.
   r   : objek data (kunci = nama kolom)
   img : { ktp, ttd, ttd2 } berupa data URL / ''
   auto: true -> langsung membuka dialog cetak */
function buildKreditPrint(r, img, auto) {
  img = img || {};
  const abs = f => new URL(f, location.href).href;
  const clean = x => (x === '-' || x == null) ? '' : x;
  const v = h => kEsc(clean(r[h]));
  const row = (l, x) => `<div class="r"><span>${l}</span><span>:</span><span class="v">${x}</span></div>`;
  const R = (l, h) => row(l, v(h));
  const tp = String(r['Tanggal Pengajuan'] || '').slice(0, 10);
  const dt = /^\d{4}-\d{2}-\d{2}$/.test(tp) ? new Date(tp + 'T00:00:00') : new Date(r['Timestamp'] || Date.now());
  const tgl = (isNaN(dt) ? new Date() : dt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const lahirD = new Date(String(r['Tanggal Lahir'] || '').slice(0, 10) + 'T00:00:00');
  const lahir = kEsc(clean(r['Tempat Lahir'])) + ', ' +
    (isNaN(lahirD) ? '' : lahirD.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
  const checklist = ['FC KTP Suami/Istri', 'FC Kartu Keluarga', 'FC Buku Nikah', 'FC Agunan (Sertifikat, BPKB, dll)',
    'FC SIUP/TDP/Ket. Usaha', 'FC Bukti Bayar (PLN, PDAM, Telepon, dll)', 'FC Rekening Deposito, Tabungan, dll', 'Lainnya'];
  const sig = (src, nama, lbl) => `<div class="sg"><div class="sb">${src ? `<img src="${src}" alt="">` : ''}</div>
    <div class="sn">( ${kEsc(clean(nama))} )</div><div class="sl">${lbl}</div></div>`;

  return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8">
<title>Permohonan Kredit - ${v('Nama Lengkap')}</title>
<style>
@page{size:A4 portrait;margin:7mm}
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:Arial,sans-serif;font-size:8.5px;color:#111;margin:0}
.bn{width:100%;display:block}
.hd{border:1px solid #222;border-bottom:0;line-height:0}
.g2{display:grid;grid-template-columns:1fr 1fr;border:1px solid #222;border-top:0}
.c{padding:3px 6px}.c+.c{border-left:1px solid #222}
.c .blk{border-bottom:1px solid #222;margin:0 -6px;padding:3px 6px}.c .blk:last-child{border-bottom:0}
.t{font-weight:700;margin:2px 0}
.r{display:grid;grid-template-columns:36% 8px 1fr;line-height:14.5px}
.v{border-bottom:1px dotted #555;font-weight:600;word-break:break-word;min-height:12px}
.sub{margin-top:4px;font-size:8px}
.stm{font-size:8px;line-height:1.35}
.rc{padding-bottom:0;display:flex;flex-direction:column}
.rc .blk:last-child{flex:1;display:flex;flex-direction:column;padding-bottom:0}
.rc .sgw{flex:1}
.sgw{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid #222;margin:4px -6px 0}
.sg{display:flex;flex-direction:column}.sg+.sg{border-left:1px solid #222}
.sb{flex:1;min-height:62px;display:flex;align-items:center;justify-content:center}
.sb img{max-width:90%;max-height:58px}.sn{text-align:center;font-size:8px;padding:1px}
.sl{text-align:center;border-top:1px solid #222;padding:2px;font-size:8.5px}
.adm{display:flex;align-items:flex-end;gap:6px;padding-right:10%}
.adm i{flex:1;border-bottom:1px dotted #555;height:12px}
.ln{border-bottom:1px dotted #555;height:17px}
table{width:100%;border-collapse:collapse;font-size:7.5px}
td{border:1px solid #222;padding:2px 4px;height:15px}td+td{width:40px}
.ft{margin-top:6px}
</style></head><body>
<div class="hd"><svg viewBox="0 0 977 92" width="100%" xmlns="http://www.w3.org/2000/svg" style="display:block">
  <!-- latar hijau -->
  <rect width="977" height="92" fill="#2e9e3a"/>
  <rect x="330" width="647" height="92" fill="#34a03c"/>
  <!-- panel putih miring -->
  <polygon points="0,0 332,0 322,40 0,92" fill="#fff"/>
  <!-- logo -->
  <g transform="rotate(-14 62 44)">
    <ellipse cx="62" cy="44" rx="46" ry="19" fill="#f4bd1b"/>
    <ellipse cx="62" cy="44" rx="46" ry="19" fill="none" stroke="#2a4fa6" stroke-width="3"/>
    <ellipse cx="62" cy="44" rx="37" ry="9" fill="none" stroke="#2a4fa6" stroke-width="1.8" transform="rotate(28 62 44)"/>
  </g>
  <path d="M26 66 Q56 77 98 60" fill="none" stroke="#d9342b" stroke-width="2.5" stroke-linecap="round"/>
  <text x="64" y="60" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-style="italic" font-weight="700" font-size="50" fill="#d9342b" stroke="#fff" stroke-width="1" paint-order="stroke">A</text>
  <text x="62" y="86" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="7" letter-spacing="1.5" fill="#2a4fa6">BPR ARAYA ARTA</text>
  <!-- identitas perusahaan -->
  <text x="124" y="32" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="19" fill="#2a4fa6">PT. BPR ARAYA ARTA</text>
  <text x="130" y="52" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="11" fill="#2a4fa6">JL. HM. SARBINI 87 KEBUMEN</text>
  <!-- judul -->
  <text x="655" y="54" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="28" letter-spacing="1" fill="#fff">PEMOHON KREDIT</text>
</svg></div>

<div class="g2" style="border-top:1px solid #222">
  <div class="c">${row('Pinjaman diajukan', 'Rp ' + v('Pinjaman Diajukan'))}${row('Jangka waktu', v('Jangka Waktu') + ' bulan')}${row('Sanggup mengangsur', 'Rp ' + v('Sanggup Mengangsur') + ' /bulan')}</div>
  <div class="c"><b>Terbilang :</b> <i>${v('Terbilang')}</i></div>
</div>

<div class="g2">
  <div class="c">
    <div class="blk"><div class="t">DATA PEMOHON</div>
      ${R('Nama (sesuai KTP)', 'Nama Lengkap')}${R('Nama Panggilan', 'Nama Panggilan')}${R('Jenis Kelamin', 'Jenis Kelamin')}
      ${row('Tempat &amp; tgl lahir', lahir)}${R('Pendidikan Terakhir', 'Pendidikan')}${R('Status Perkawinan', 'Status Perkawinan')}
      ${R('Nama Istri/Suami', 'Nama Pasangan')}${R('Nama Ibu Kandung', 'Nama Ibu Kandung')}${R('Jumlah tanggungan', 'Jumlah Tanggungan')}</div>
    <div class="blk"><div class="t">TEMPAT TINGGAL</div>
      ${R('Alamat Saat Ini', 'Alamat')}${R('RT / RW', 'RT/RW')}${R('Kelurahan / Desa', 'Kelurahan/Desa')}${R('Kecamatan', 'Kecamatan')}
      ${R('Kota / Kabupaten', 'Kota/Kabupaten')}${R('No. HP', 'No. HP')}${R('Status Tempat Tinggal', 'Status Tempat Tinggal')}
      ${R('Lama Menempati Rumah', 'Lama Menempati')}${R('Alamat Sesuai KTP', 'Alamat KTP')}</div>
    <div class="blk"><div class="t">Keluarga/ Kerabat yang dapat dihubungi</div>
      ${R('Nama', 'Kerabat Nama')}${R('No HP', 'Kerabat No HP')}${R('Alamat', 'Kerabat Alamat')}${R('Hubungan', 'Kerabat Hubungan')}</div>
  </div>
  <div class="c rc">
    <div class="blk"><div class="t">PENGGUNAAN</div>
      ${R('Pinjaman untuk', 'Tujuan Pinjaman')}${R('Usaha Utama', 'Usaha Utama')}${R('Usaha Tambahan', 'Usaha Tambahan')}
      ${row('Mulai Usaha/ Bekerja', 'Tahun ' + v('Mulai Usaha/Bekerja'))}${R('No. NPWP (jika ada)', 'NPWP')}${R('Pinjaman Bank lain', 'Pinjaman Bank Lain')}</div>
    <div class="blk"><div class="t">JAMINAN</div>
      ${R('Jenis jaminan', 'Jenis Jaminan')}${R('Status jaminan', 'Status Jaminan')}${R('Jaminan digunakan oleh', 'Jaminan Digunakan Oleh')}
      ${R('Hubungan dengan pemilik', 'Hubungan Pemilik')}${R('Jumlah jaminan', 'Jumlah Jaminan')}${R('Nama jaminan', 'Nama Jaminan')}</div>
    <div class="blk stm">Atas permohonan dan data yang saya berikan, Bank diijinkan untuk mengakses informasi keuangan milik saya dan pihak terkait dalam Sistem Layanan Informasi Keuangan (SLIK) Otoritas Jasa Keuangan (OJK)</div>
    <div class="blk">Tanggal : ${kEsc(tgl)}
      <div class="sgw">${sig(img.ttd, r['Nama Lengkap'], 'Pemohon')}${sig(img.ttd2, r['Nama TTD 2'], 'Suami/Istri/Orang Tua')}</div></div>
  </div>
</div>

<div class="g2">
  <div class="c">
    <div class="t">DI ISI OLEH BANK</div>
    ${row('Nama Marketing', '')}<div class="r"><span>Catatan Administrasi</span><span>:</span><span class="adm"><i></i><b>Lama / Baru</b></span></div>
    <p class="stm" style="margin:4px 0">Dengan menandatangani formulir ini, saya menyatakan telah melakukan verifikasi dan konfirmasi data pemohon.</p>
    <div style="margin-top:8px">Catatan Lainnya :</div><div class="ln"></div><div class="ln"></div><div class="ln"></div>
  </div>
  <div class="c"><table><tr><td colspan="2"><b>Cek List Dokumen</b></td></tr>
    ${checklist.map(x => `<tr><td>${x}</td><td></td></tr>`).join('')}</table>
    <div style="text-align:center;margin-top:14px">Paraf Marketing</div></div>
</div>
<img class="bn ft" src="${abs('banner-bpr.png')}" alt="">
${auto ? '<script>window.onload=function(){setTimeout(function(){window.print()},500)}<\/script>' : ''}
</body></html>`;
}


/* =====================================================================
   Helper form bersama (dipakai dashboard untuk Tambah / Edit data)
   ===================================================================== */
const kId = (pre, h) => pre + h.replace(/\W/g, '_');

function kFieldHtml([h, l, t, o, req, full], pre) {
  const a = `id="${kId(pre, h)}" data-h="${kEsc(h)}" data-t="${t}" ${req ? 'required' : ''}`;
  let el;
  if (t === 'select')
    el = `<select ${a}><option value="">-- Pilih --</option>${o.map(x => `<option>${kEsc(x)}</option>`).join('')}</select>` +
      (o.includes('Lainnya') ? '<input class="other" data-other hidden placeholder="Sebutkan lainnya">' : '');
  else if (t === 'textarea') el = `<textarea rows="2" ${a}></textarea>`;
  else if (t === 'terbilang') el = `<input readonly placeholder="Terisi otomatis" ${a}>`;
  else if (t === 'date') el = `<input type="date" ${a}>`;
  else el = `<input type="text" ${['rupiah', 'number', 'tel'].includes(t) ? 'inputmode="numeric"' : ''} ${a}>`;
  return `<div class="field ${full ? 'full' : ''}"><label>${kEsc(l)}${req ? ' *' : ''}</label>${el}</div>`;
}

/* Pasang perilaku: format rupiah, hanya angka, terbilang otomatis, kolom "Lainnya" */
function kBind(root) {
  root.addEventListener('input', e => {
    const el = e.target, t = el.dataset.t;
    if (t === 'rupiah') {
      const d = el.value.replace(/\D/g, '');
      el.value = d ? Number(d).toLocaleString('id-ID') : '';
      if (el.dataset.h === 'Pinjaman Diajukan') { const tb = root.querySelector('[data-h="Terbilang"]'); if (tb) tb.value = terbilang(d); }
    } else if (t === 'number' || t === 'tel') el.value = el.value.replace(/\D/g, '').slice(0, t === 'tel' ? 13 : 12);
  });
  root.addEventListener('change', e => {
    const s = e.target, o = s.nextElementSibling;
    if (s.tagName !== 'SELECT' || !o || !('other' in o.dataset)) return;
    o.hidden = s.value !== 'Lainnya';
    if (o.hidden) o.value = '';
  });
}

/* Ambil semua isian -> { data, bad } ; bad = elemen wajib yang masih kosong */
function kCollect(root) {
  const data = {}; let bad = null;
  root.querySelectorAll('[data-h]').forEach(el => {
    let v = el.value.trim();
    const o = el.nextElementSibling;
    if (v === 'Lainnya' && o && 'other' in o.dataset) { if (!o.value.trim()) bad = bad || o; v = 'Lainnya: ' + o.value.trim(); }
    if (el.required && !v) bad = bad || el;
    data[el.dataset.h] = v || '-';
  });
  data['Terbilang'] = terbilang((data['Pinjaman Diajukan'] || '').replace(/\D/g, '')) || '-';
  return { data, bad };
}

/* Isi form dari satu record (r = null untuk form kosong) */
function kFill(root, r) {
  root.querySelectorAll('[data-h]').forEach(el => {
    let v = r ? r[el.dataset.h] : '';
    v = (v == null || v === '-') ? '' : String(v);
    if (el.dataset.t === 'date') v = v.slice(0, 10);
    const o = el.nextElementSibling, has = o && 'other' in o.dataset;
    if (el.tagName === 'SELECT' && /^Lainnya: /.test(v) && has) { el.value = 'Lainnya'; o.hidden = false; o.value = v.slice(9); return; }
    el.value = v;
    if (has) { o.hidden = true; o.value = ''; }
  });
}

/* File gambar -> data URL JPEG yang sudah dikecilkan */
function kCompress(file, max) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onerror = () => rej(new Error('Gagal membaca file.'));
    fr.onload = () => {
      const i = new Image();
      i.onerror = () => rej(new Error('File gambar rusak.'));
      i.onload = () => {
        const sc = Math.min(1, max / Math.max(i.width, i.height)), c = document.createElement('canvas');
        c.width = Math.round(i.width * sc); c.height = Math.round(i.height * sc);
        const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
        x.drawImage(i, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', .85));
      };
      i.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}
