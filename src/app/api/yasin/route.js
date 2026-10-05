import { NextResponse } from 'next/server';

export async function GET() {
  try {
    let res = await fetch('https://equran.id/api/v2/surat/36', {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      },
      next: { revalidate: 86400 } // Cache data di server Vercel selama 24 jam
    });

    if (!res.ok) {
      res = await fetch('https://api.myquran.com/v2/quran/surat/36');
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: `Gagal mengambil data dari server Quran (Status ${res.status})` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Yasin Proxy Error:', error);
    return NextResponse.json(
      { error: 'Gagal terhubung ke server Al-Qur\'an' },
      { status: 500 }
    );
  }
}
