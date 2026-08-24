'use client'

import React, { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Preferences } from '@capacitor/preferences'

type Props = {
  children?: React.ReactNode
}

const DEFAULT_COORDS = { latitude: -6.732, longitude: 108.557 } // Cirebon
const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
const ANDROID_CHANNEL_ID = 'adzan_channel'

export default function ClientLayout({ children }: Props) {
  useEffect(() => {
    // Jalankan fitur Native Capacitor hanya jika aplikasi berjalan di Mobile Device (Native)
    if (Capacitor.isNativePlatform()) {
      void initAdzanScheduling()
    }
  }, [])

  async function initAdzanScheduling() {
    try {
      await requestPermissions()
      await setupAndroidNotificationChannel() // Menyiapkan channel untuk Android 8.0+
      const coords = await getCoordsWithFallback()
      const timings = await fetchTodayTimings(coords.latitude, coords.longitude)
      
      if (timings.length === 0) {
        console.warn('Tidak dapat mengambil jadwal sholat hari ini.')
        return
      }
      
      await cancelExistingScheduledNotifications()
      await scheduleDailyAdzan(timings)
      await persistTimingsForNative(timings)
      console.log('Penjadwalan notifikasi adzan selesai.')
    } catch (err) {
      console.error('Gagal inisialisasi adzan otomatis:', err)
    }
  }

  async function requestPermissions() {
    try {
      await Geolocation.requestPermissions()
    } catch (err) {
      console.warn('Gagal request Geolocation permission:', err)
    }

    try {
      const perm = await LocalNotifications.requestPermissions()
      console.log('LocalNotifications permission result:', perm)
    } catch (err) {
      console.warn('Gagal request LocalNotifications permission:', err)
    }
  }

  // Membuat Channel Notifikasi khusus di Android untuk mengaktifkan audio Adzan & High Priority
  async function setupAndroidNotificationChannel() {
    if (Capacitor.getPlatform() !== 'android') return

    try {
      await LocalNotifications.createChannel({
        id: ANDROID_CHANNEL_ID,
        name: 'Notifikasi Adzan Sholat',
        description: 'Channel untuk memutar audio adzan saat waktu sholat tiba',
        sound: 'adzan.mp3', // Harus ditempatkan di folder: android/app/src/main/res/raw/adzan.mp3
        importance: 5, // High Importance (Tampil di atas layar / Banner)
        visibility: 1, // Public visibility on lockscreen
        vibration: true,
      })
    } catch (err) {
      console.warn('Gagal membuat Android notification channel:', err)
    }
  }

  async function getCoordsWithFallback() {
    try {
      const pos = await Geolocation.getCurrentPosition({ timeout: 10000 })
      if (pos && pos.coords) {
        const { latitude, longitude } = pos.coords
        console.log('Diperoleh GPS:', latitude, longitude)
        return { latitude, longitude }
      }
      throw new Error('Position tidak tersedia')
    } catch (err) {
      console.warn('Gagal ambil GPS, pakai default Cirebon:', err)
      return DEFAULT_COORDS
    }
  }

  async function fetchTodayTimings(lat: number, lon: number) {
    try {
      const endpoint = `https://api.aladhan.com/v1/timings?latitude=${encodeURIComponent(
        lat,
      )}&longitude=${encodeURIComponent(lon)}&method=20`
      const res = await fetch(endpoint)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const timingsObj = json?.data?.timings
      if (!timingsObj) throw new Error('Response API tidak mengandung timings')
      
      const now = new Date()
      const parsed: { name: string; at: Date }[] = []

      for (const name of PRAYERS) {
        const timeStr: string = timingsObj[name]
        if (!timeStr) continue
        const at = parseTimeForToday(timeStr, now)
        parsed.push({ name, at })
      }
      return parsed
    } catch (err) {
      console.error('Gagal fetch jadwal sholat:', err)
      return []
    }
  }

  function parseTimeForToday(timeStr: string, referenceDate: Date) {
    const m = timeStr.match(/(\d{1,2}):(\d{2})/)
    if (!m) {
      return new Date(referenceDate.getTime() + 60 * 1000)
    }
    const hours = parseInt(m[1], 10)
    const minutes = parseInt(m[2], 10)
    const d = new Date(referenceDate)
    d.setHours(hours, minutes, 0, 0)
    
    // Jika waktu sholat hari ini sudah lewat, jadwalkan untuk besok
    if (d.getTime() <= Date.now()) {
      d.setDate(d.getDate() + 1)
    }
    return d
  }

  async function cancelExistingScheduledNotifications() {
    try {
      const pending = await LocalNotifications.getPending()
      const pendingList = pending?.notifications ?? []
      if (pendingList.length === 0) return

      await LocalNotifications.cancel({
        notifications: pendingList.map((n) => ({ id: n.id })),
      })
    } catch (err) {
      console.warn('Gagal membatalkan scheduled notifications:', err)
    }
  }

  async function scheduleDailyAdzan(timings: { name: string; at: Date }[]) {
    try {
      const notifications = timings.map((t, idx) => {
        const id = 1000 + idx
        return {
          id,
          title: `🕌 Waktu Sholat ${t.name} Tiba`,
          body: `Telah masuk waktu sholat ${t.name} untuk wilayah Anda.`,
          schedule: {
            at: t.at,
            repeats: true,
            every: 'day' as const, // Memastikan pengulangan dilakukan harian
          },
          android: {
            channelId: ANDROID_CHANNEL_ID,
            smallIcon: 'ic_stat_icon_config_sample', // Sesuaikan dengan icon notifikasi Android jika ada
            sound: 'adzan', // Tanpa ekstensi .mp3 untuk android res/raw
          },
          channelId: ANDROID_CHANNEL_ID,
          sound: 'adzan.mp3', // Ekstensi .mp3 untuk iOS resourceloader
        }
      })

      await LocalNotifications.schedule({ notifications })
      console.log('Notifikasi adzan berhasil dijadwalkan.')
    } catch (err) {
      console.error('Gagal schedule notifications:', err)
    }
  }

  async function persistTimingsForNative(timings: { name: string; at: Date }[]) {
    try {
      const data = timings.map((t) => ({ name: t.name, time: t.at.toISOString() }))
      await Preferences.set({ key: 'adzan_timings', value: JSON.stringify(data) })
    } catch (err) {
      console.warn('Gagal simpan jadwal ke Preferences:', err)
    }
  }

  return <>{children}</>
}
