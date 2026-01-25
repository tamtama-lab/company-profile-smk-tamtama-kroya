# Dokumentasi Flow Pendaftaran

## Overview

Sistem pendaftaran SMK Tamtama Kroya terdiri dari 5 section yang harus diisi secara berurutan dengan validasi data ketat dan kemampuan menyimpan data saat navigasi kembali.

## Architecture Flow

### 1. Data Structure

```
RegistrationData (state parent)
├── biodataSiswa: BiodataSiswaForm
├── biodataOrangTua: BiodataOrangTuaForm
├── biodataWali: BiodataWaliForm
└── pilihJurusan: PilihJurusanForm
```

### 2. Section Flow

#### Section 1: Biodata Siswa

**Fields yang wajib diisi:**

- Nama Lengkap (sesuai KK)
- Email Aktif
- Tempat Lahir
- Tanggal Lahir
- Asal Sekolah (SMP/MTs)
- Alamat
- Jenis Kelamin
- Agama
- Nomor WhatsApp

**Optional Fields:**

- NIK
- NISN
- Penerima KIP

**Buttons:**

- ← Kembali: Ke halaman utama
- Selanjutnya: Simpan data dan lanjut ke Biodata Orang Tua
- Batal: Reset form

#### Section 2: Biodata Orang Tua

**Fields yang wajib diisi:**

- Nama Ayah
- Kondisi Ayah (Hidup/Meninggal)
- Nama Ibu
- Kondisi Ibu (Hidup/Meninggal)
- Alamat
- Nomor Telpon Orang Tua

**Buttons:**

- ← Kembali: Ke Biodata Siswa (data tetap tersimpan)
- Selanjutnya: Simpan data dan lanjut ke Biodata Wali
- Batal: Reset form

#### Section 3: Biodata Wali

**Fields yang wajib diisi:**

- Nama Wali
- Nomor Telpon Wali
- Alamat Wali

**Optional Fields:**

- NIK Wali
- Pekerjaan Wali
- Penghasilan Wali
- Hubungan Dengan Siswa

**Note:** Data wali hanya perlu diisi jika orang tua tidak dapat dihubungi atau tidak tersedia.

**Buttons:**

- ← Kembali: Ke Biodata Orang Tua (data tetap tersimpan)
- Selanjutnya: Simpan data dan lanjut ke Pilih Jurusan
- Batal: Reset form

#### Section 4: Pilih Jurusan

**Fields yang wajib diisi:**

- Jurusan yang Diminati (TKR, TITL, TP, DKV)

**Buttons:**

- ← Kembali: Ke Biodata Wali (data tetap tersimpan)
- Selanjutnya: Simpan data dan lanjut ke Selesai
- Batal: Reset form

#### Section 5: Selesai (Review & Submit)

**Menampilkan:**

- Summary dari semua data yang sudah diisi
- Info penting tentang bukti pendaftaran

**Buttons:**

- ← Kembali: Ke Pilih Jurusan (data tetap tersimpan)
- Lihat Detail Data: Buka modal preview dengan semua data
- Kosongkan Formulir: Reset semua data dan kembali ke awal
- Konfirmasi Pendaftaran: Kirim data ke backend

## Handler Functions

### Data Handlers (Save Data)

```javascript
handleNextBiodataSiswa(data); // Simpan & lanjut ke section berikutnya
handleNextBiodataOrangTua(data);
handleNextBiodataWali(data);
handleNextPilihJurusan(data);
```

### Navigation Handlers (Go Back)

```javascript
handlePrevBiodataOrangTua(); // Kembali ke section sebelumnya
handlePrevBiodataWali();
handlePrevPilihJurusan();
handlePrevSelesai();
```

### Reset Handlers (Clear Form)

```javascript
handleResetBiodataSiswa(); // Reset data dan stay di section
handleResetBiodataOrangTua();
handleResetBiodataWali();
handleResetPilihJurusan();
```

### Validation Handler

```javascript
handleValidationError(message); // Tampilkan alert jika data tidak lengkap
```

### Submit Handler

```javascript
handleSubmitSelesai(); // Kirim ke backend
// 1. Validasi semua section sudah terisi
// 2. Transform data ke format API
// 3. POST ke /api/registrations
// 4. Handle success/error response
```

## Validation Rules

### BiodataSiswa Validation

```typescript
const validateBiodataSiswa = (data: BiodataSiswaForm): string | null => {
  if (!data.namaLengkap?.trim()) return "Nama Lengkap harus diisi";
  if (!data.email?.trim()) return "Email harus diisi";
  if (!data.tempatLahir?.trim()) return "Tempat Lahir harus diisi";
  if (!data.tanggalLahir?.trim()) return "Tanggal Lahir harus diisi";
  if (!data.asalSekolah?.trim()) return "Asal Sekolah harus diisi";
  if (!data.alamat?.trim()) return "Alamat harus diisi";
  if (!data.jenisKelamin?.trim()) return "Jenis Kelamin harus dipilih";
  if (!data.agama?.trim()) return "Agama harus dipilih";
  if (!data.nomorWhatsapp?.trim()) return "Nomor WhatsApp harus diisi";
  return null;
};
```

Validasi serupa berlaku untuk:

- BiodataOrangTua (6 field)
- BiodataWali (3 field)
- PilihJurusan (1 field)

## Alert Behavior

### Validation Error Alert

- **Title:** "Data Tidak Lengkap"
- **Message:** Pesan spesifik field mana yang belum diisi
- **Variant:** warning (yellow/amber)
- **Auto-dismiss:** Ya, setelah 5 detik

### Submission Error Alert

- **Title:** "Gagal mendaftar" atau "Terjadi kesalahan"
- **Message:** Error message dari backend atau generic error
- **Variant:** error (red)
- **Auto-dismiss:** Tidak, user harus close manual

### Success

- Modal sukses muncul dengan registration ID dan nama siswa
- Setelah ditutup, redirect ke halaman utama

## Data Persistence

### Local State Management

```javascript
const [registrationData, setRegistrationData] =
  useState < RegistrationData > {};
```

Data tersimpan di parent component (page.tsx) dan:

1. Passed ke form components sebagai `initialData` prop
2. Diperbarui saat user klik "Selanjutnya"
3. Dihapus saat user klik "Batal" (per section)
4. Dihapus saat submit sukses

### Data Flow

```
User Input → Form Component
          ↓
   handleChange() updates local state
          ↓
   handleSubmit() validates data
          ↓
   If valid: onNext() callback
          ↓
   Parent updates registrationData state
          ↓
   Navigate to next section
          ↓
   Form receives initialData from registrationData
```

## API Integration

### Endpoint

```
POST /api/registrations
```

### Request Payload

```json
{
  "studentDetail": {
    "nisn": "string",
    "nik": "string",
    "fullName": "string",
    "placeOfBirth": "string",
    "dateOfBirth": "YYYY-MM-DD",
    "gender": "string",
    "religion": "string",
    "schoolOriginNpsn": "string",
    "address": "string",
    "phoneNumber": "string",
    "email": "string",
    "isKipRecipient": "boolean"
  },
  "parentDetail": {
    "fatherName": "string",
    "fatherLivingStatus": "string",
    "motherName": "string",
    "motherLivingStatus": "string",
    "parentPhoneNumber": "string",
    "parentAddress": "string",
    "guardianName": "string",
    "guardianPhoneNumber": "string",
    "guardianAddress": "string"
  },
  "majorChoiceCode": "string"
}
```

### Response Success

```json
{
  "success": true,
  "data": {
    "registrationId": "REG-2024-001",
    "studentName": "John Doe"
  }
}
```

### Response Error

```json
{
  "success": false,
  "message": "Error message"
}
```

### Data Transformation

File: `app/utils/transformRegistrationData.ts`

Mapping dari form format ke API format:

- `namaLengkap` → `fullName`
- `adaKip` (boolean) → `isKipRecipient` (boolean)
- `nomorWhatsapp` → `phoneNumber`
- Dan seterusnya...

## Preview Modal

### ModalPreviewData Component

- Menampilkan semua data dalam format organized
- 4 section: Biodata Siswa, Biodata Orang Tua, Biodata Wali, Pilih Jurusan
- Biodata Siswa: 2 column layout
- Lainnya: 1 column layout
- Tombol: Batal (back to review), Konfirmasi

### Label Mapping

```typescript
const labelMap: Record<string, string> = {
  namaLengkap: "Nama Lengkap",
  email: "Email",
  // ... dan seterusnya
};
```

## Edge Cases

### Case 1: User belum mengisi semua section

- ✅ Tidak bisa klik "Konfirmasi Pendaftaran" sampai semua diisi
- ✅ Alert muncul: "Data Tidak Lengkap - Semua data harus diisi sebelum mengirim"

### Case 2: User kembali ke section sebelumnya

- ✅ Data tetap tersimpan (initialData dari parent state)
- ✅ Form sudah pre-filled dengan data sebelumnya

### Case 3: User klik "Batal" di section

- ✅ Data section itu direset
- ✅ Form kembali kosong
- ✅ Tetap di section yang sama

### Case 4: Submit gagal (network error)

- ✅ Alert error muncul
- ✅ User bisa klik "Selanjutnya" lagi di modal preview
- ✅ Data tetap tersimpan

### Case 5: Submit gagal (validation backend)

- ✅ Alert error dengan message dari backend
- ✅ User bisa klik "Kembali" untuk edit
- ✅ Data tetap tersimpan

## Testing Checklist

- [ ] Isi Biodata Siswa, cek validation error jika ada field kosong
- [ ] Isi semua field, klik Selanjutnya, data tersimpan
- [ ] Klik Kembali di Biodata Orang Tua, data Siswa tetap ada
- [ ] Klik Batal di Biodata Wali, form reset
- [ ] Isi semua section sampai Selesai
- [ ] Klik "Lihat Detail Data", cek semua data muncul dengan benar
- [ ] Klik "Konfirmasi Pendaftaran", tunggu loading
- [ ] Cek console untuk log payload yang dikirim
- [ ] Verify response sukses dari backend
- [ ] Cek success modal muncul dengan registration ID
- [ ] Close modal, verify redirect ke halaman utama

## Files Modified

1. **app/pendaftaran/page.tsx**
   - Tambah validation error handler
   - Improve submit handler dengan validasi lengkap

2. **app/components/RegistrationForm/BiodataSiswa/index.tsx**
   - Tambah validation function
   - Tambah initialData prop

3. **app/components/RegistrationForm/BiodataOrangTua/index.tsx**
   - Tambah validation function
   - Tambah initialData prop

4. **app/components/RegistrationForm/BiodataWali/index.tsx**
   - Tambah validation function
   - Tambah initialData prop

5. **app/components/RegistrationForm/PilihJurusan/index.tsx**
   - Tambah validation function
   - Tambah initialData prop

6. **app/components/RegistrationForm/Selesai/index.tsx**
   - Fix button functionality (back vs reset)

## Notes

- Semua error messages dalam Bahasa Indonesia
- Alert dengan variant "warning" untuk validation errors
- Alert dengan variant "error" untuk submission errors
- Console logging untuk debugging (payload dan response)
- Data persisten sampai sukses submit atau user reset
- Session storage tidak digunakan (hanya in-memory state)
