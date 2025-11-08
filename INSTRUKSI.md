# Update Files untuk Supabase Integration

## 📋 Instruksi Replace File

⚠️ WARNING: Backup project Anda sebelum mengganti file!

### 1. Environment Variables
Copy file `.env.local` ke root project Anda (ganti yang ada)

### 2. Database Schema
Jalankan SQL dari file `database-schema.sql` di Supabase Dashboard → SQL Editor

### 3. Update File Library
Ganti semua file di `src/lib/`

### 4. Update Halaman Admin
Ganti semua file di `src/app/admin/`

### 5. Update Halaman Employee
Ganti semua file di `src/app/employee/`

### 6. Update Komponen
Ganti file di `src/components/`

### 7. Update Halaman Lain
Ganti file di `src/app/`

## 🔧 Setelah Replace

1. Commit dan push ke GitHub
2. Vercel akan auto-deploy
3. Test di aplikasi Vercel

---
Dibuat oleh MiniMax Agent | 2025-11-08
