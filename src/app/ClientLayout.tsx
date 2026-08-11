'use client'

import React, { useEffect } from 'react'
import { Geolocation } from '@capacitor/geolocation'
import { LocalNotifications } from '@capacitor/local-notifications'

type Props = {
  children?: React.ReactNode
}

const DEFAULT_COORDS = { latitude: -6.732, longitude: 108.557 } // Cirebon
const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

export default function ClientLayout({ children }: Props) {
  useEffect(() => {
    void initAdzanScheduling()
  }, [])

  async function initAdzanScheduling() {
    try {
      await requestPermissions()
      const coords = await getCoordsWithFallback()
      const timings = await fetchTodayTimings(coords.latitude, coords.longitude)
      if (timings.length === 0) {
        console.warn('Tidak dapat mengambil jadwal sholat hari ini.')
        return
      }
      await cancelExistingScheduledNotifications()
      await scheduleDailyAdzan(timings)
      console.log('Penjadwalan notifikasi adzan selesai.')
    } catch (err) {
      console.error('Gagal inisialisasi adzan otomatis:', err)
    }
  }

  async function requestPermissions() {
    try {
      // Geolocation permissions (Android/iOS)
      await Geolocation.requestPermissions()
    } catch (err) {
      console.warn('Gagal request Geolocation permission:', err)
    }

    try {
      // Local notifications permissions (incl. Android 13 POST_NOTIFICATIONS)
      const perm = await LocalNotifications.requestPermissions()
      console.log('LocalNotifications permission result:', perm)
    } catch (err) {
      console.warn('Gagal request LocalNotifications permission:', err)
    }
  }

  async function getCoordsWithFallback() {
    try {
      const pos = await Geolocation.getCurrentPosition()
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
      const endpoint = `https://api.aladhan.com/v1/timesByCoordinates?latitude=${encodeURIComponent(
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
      const fallback = new Date(referenceDate.getTime() + 60 * 1000)
      return fallback
    }
    const hours = parseInt(m[1], 10)
    const minutes = parseInt(m[2], 10)
    const d = new Date(referenceDate)
    d.setHours(hours, minutes, 0, 0)
    if (d.getTime() <= Date.now()) {
      d.setDate(d.getDate() + 1)
    }
    return d
  }

  async function cancelExistingScheduledNotifications() {
    try {
      const pending = await LocalNotifications.getPending()
      const pendingList = pending?.notifications ?? []
      if (pendingList.length === 0) {
        console.log('Tidak ada pending notifications untuk dibatalkan.')
        return
      }
      await LocalNotifications.cancel({
        notifications: pendingList.map((n) => ({ id: n.id })),
      })
      console.log(`Dibatalkan ${pendingList.length} pending notification(s).`)
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
          title: `Adzan - ${t.name}`,
          body: `Waktu sholat: ${t.name}`,
          schedule: {
            at: t.at,
            repeats: true,
          },
          sound: 'adzan.mp3',
        }
      })

      await LocalNotifications.schedule({ notifications })
      console.log('Scheduled notifications:', notifications.map((n) => ({ id: n.id, at: n.schedule?.at })))
    } catch (err) {
      console.error('Gagal schedule notifications:', err)
    }
  }

  return <>{children}</>
}
