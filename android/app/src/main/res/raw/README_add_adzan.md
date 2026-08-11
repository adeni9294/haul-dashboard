# Tambahkan adzan.mp3 ke folder res/raw

Plugin LocalNotifications di Android akan mencari sound di resource raw saat channel notifikasi dibuat.
File: android/app/src/main/res/raw/adzan.mp3

Langkah:
1. Buat folder jika belum ada:
   mkdir -p android/app/src/main/res/raw
2. Salin file MP3 adzan yang ingin dipakai ke path di atas dengan nama `adzan.mp3`.

Catatan:
- Pastikan nama file lowercase dan hanya karakter alfanumerik/underscore.
- Setelah menambahkan file, jalankan `npx cap sync android` dan rebuild aplikasi.
- Jika notifikasi tidak berbunyi, periksa channel notifikasi (Settings -> Apps -> YourApp -> Notifications) dan pastikan channel "Adzan Notifications" menggunakan sound yang benar.
