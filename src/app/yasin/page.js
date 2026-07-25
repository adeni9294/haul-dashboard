'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ZoomIn, ZoomOut, Loader2, BookOpen } from 'lucide-react';

// DATA BACAAN TAHLIL LENGKAP STANDAR NU
const TAHLIL_TEXT = [
  { id: 1, arab: "إِلَى حَضْرَةِ النَّبِيِّ الْمُصْطَفَى مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ وَآلِهِ وَأَزْوَاجِهِ وَذُرِّيَّاتِهِ وَأَهْلِ بَيْتِهِ الْكِرَامِ، شَيْءٌ لِلّٰهِ لَهُمُ الْفَاتِحَةُ...", latin: "Ila hadhratin-nabiyyil musthafa muhammadin sallallahu 'alaihi wasallama wa alihi wa azwajihi wa dhurriyyatihi wa ahli baitihil kiram, syai'ul lillahi lahumul fatihah...", indo: "Pengantar Fatihah untuk Baginda Nabi Muhammad SAW, keluarga, istri-istri, keturunan, dan ahli baitnya." },
  { id: 2, arab: "ثُمَّ إِلَى حَضَرَاتِ إِخْوَانِهِ مِنَ الأَنْبِيَاءِ وَالْمُرْسَلِيْنَ وَالأَوْلِيَاءِ وَالشُّهَدَاءِ وَالصَّالِحِيْنَ وَالصَّحَابَةِ وَالتَّابِعِيْنَ، وَخُصُوْصًا إِلَى صَاحِبِ هٰذِهِ الْمَقْبَرَةِ (بُويُوت كِبُوه وَبُويُوت بِسُوس)، لَهُمُ الْفَاتِحَةُ...", latin: "Thumma ila hadharati ikhwanihi minal anbiya'i wal mursalin wal auliya'i wash-shuhada'i wash-shalihin... wa khususan ila sahibi hadhihil maqbarah, lahumul fatihah...", indo: "Pengantar Fatihah untuk para Nabi, Wali, Syuhada, Orang-orang Shaleh, dan Khususon Ahli Kubur Maqbaroh (Buyut Kepuh & Buyut Besus)." },
  { id: 3, arab: "قُلْ هُوَ اللّٰهُ أَحَدٌ، اللّٰهُ الصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ", latin: "Surah Al-Ikhlas (3x)", indo: "Membaca Surah Al-Ikhlas sebanyak 3 kali." },
  { id: 4, arab: "لَا إِلٰهَ إِلَّا اللّٰهُ وَاللّٰهُ أَكْبَرُ، وَلِلّٰهِ الْحَمْدُ", latin: "La ilaha illallahu wallahu akbar, walillahil hamd", indo: "Tahlil dan Takbir." },
  { id: 5, arab: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ...", latin: "Surah Al-Falaq", indo: "Membaca Surah Al-Falaq." },
  { id: 6, arab: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ...", latin: "Surah An-Nas", indo: "Membaca Surah An-Nas." },
  { id: 7, arab: "الم، ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِلْمُتَّقِينَ...", latin: "Surah Al-Baqarah: 1-5 (Awal Surah Al-Baqarah)", indo: "Membaca petikan awal Surah Al-Baqarah." },
  { id: 8, arab: "وَإِلَٰهُكُمْ إِلَٰهٌ وَاحِدٌ ۖ لَا إِلٰهَ إِلَّا هُوَ الرَّحْمَٰنُ الرَّحِيمُ", latin: "Wa ilahukum ilahun wahid, la ilaha illa huwar-rahmanur-rahim", indo: "Dan Tuhanmu adalah Tuhan Yang Maha Esa, tidak ada tuhan selain Dia Yang Maha Pengasih lagi Maha Penyayang." },
  { id: 9, arab: "اللّٰهُ لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ...", latin: "Ayat Kursi (Al-Baqarah: 255)", indo: "Membaca Ayat Kursi." },
  { id: 10, arab: "أَسْتَغْفِرُ اللّٰهَ الْعَظِيْمَ", latin: "Astaghfirullahal 'Adzim (33x)", indo: "Memohon ampunan kepada Allah Yang Maha Agung." },
  { id: 11, arab: "أَفْضَلُ الذِّكْرِ فَاعْلَمْ أَنَّهُ لَا إِلٰهَ إِلَّا اللهُ", latin: "Afdhaludz-dzikri fa'lam annahu la ilaha illallah", indo: "Ketahuilah bahwa sebaik-baik Dzikir adalah La Ilaha Illallah." },
  { id: 12, arab: "لَا إِلٰهَ إِلَّا اللهُ", latin: "Lā ilāha illallāh (100x / Secukupnya)", indo: "Tiada Tuhan selain Allah." },
  { id: 13, arab: "لَا إِلٰهَ إِلَّا اللهُ مُحَمَّدٌ رَسُوْلُ اللهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ", latin: "La ilaha illallahu muhammadur rasulullahi sallallahu 'alaihi wa sallam", indo: "Tiada Tuhan selain Allah, Nabi Muhammad adalah Utusan Allah." }
];

// DATA DOA HAUL & KHUSUSON ARWAH NU
const DOA_TEXT = [
  { id: 1, arab: "أَعُوْذُ بِاللهِ مِنَ الشَّيْطَانِ الرَّجِيْمِ. بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ. الْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِيْنَ حَمْدَ الشَّاكِرِيْنَ حَمْدَ النَّاعِمِيْنَ", latin: "Alhamdulillahi rabbil 'alamin, hamdansy-syakirin hamdan-na'imin...", indo: "Segala puji bagi Allah Tuhan semesta alam, pujian orang-orang yang bersyukur dan memperoleh nikmat." },
  { id: 2, arab: "اللّٰهُمَّ صَلِّ وَسَلِّمْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ", latin: "Allahumma salli wa sallim 'ala sayyidina muhammadin wa 'ala ali sayyidina muhammad", indo: "Ya Allah, limpahkanlah shalawat dan salam kepada junjungan kami Nabi Muhammad SAW dan keluarganya." },
  { id: 3, arab: "اللّٰهُمَّ تَقَبَّلْ وَأَوْصِلْ ثَوَابَ مَا قَرَأْنَاهُ مِنْ كِتَابِكَ الْعَظِيْمِ وَمَا هَلَّلْنَاهُ وَمَا سَبَّحْنَاهُ وَمَا اسْتَغْفَرْنَاهُ وَمَا صَلَّيْنَاهُ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ هَدِيَّةً وَاصِلَةً وَرَحْمَةً نَازِلَةً وَبَرَكَةً شَامِلَةً إِلَى حَضَرَةِ حَبِيْبِنَا وَشَفِيْعِنَا وَقُرَّةِ أَعْيُنِنَا سَيِّدِنَا وَمَوْلَانَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ", latin: "Allahumma taqabbal wa awsil thawaba ma qara'nahu min kitabikal 'adzim...", indo: "Ya Allah, terimalah dan sampaikanlah pahala Al-Qur'an, Tahlil, Tasbih, Istighfar, dan Shalawat yang kami baca sebagai hadiah dan rahmat bagi Baginda Nabi Muhammad SAW." },
  { id: 4, arab: "ثُمَّ إِلَى أَرْوَاحِ جَمِيْعِ أَهْلِ الْقُبُوْرِ مِنَ الْمُسْلِمِيْنَ وَالْمُسْلِمَاتِ وَالْمُؤْمِنِيْنَ وَالْمُؤْمِنَاتِ مِنْ مَشَارِقِ الْأَرْضِ إِلَى مَغَارِبِهَا، وَخُصُوْصًا إِلَى أَرْوَاحِ (بُويُوت كِبُوه وَبُويُوت بِسُوس) وَجَمِيْعِ أَبَائِنَا وَأُمَّهَاتِنَا وَأَجْدَادِنَا وَجَدَّاتِنَا", latin: "Thumma ila arwahi jami'i ahlil quburi minal muslimina wal muslimat... wa khususan ila arwahi Buyut Kepuh & Buyut Besus...", indo: "Kemudian sampaikanlah pahalanya kepada seluruh ahli kubur kaum muslimin/muslimat, khususnya roh Buyut Kepuh, Buyut Besus, serta leluhur dan orang tua kami." },
  { id: 5, arab: "اللّٰهُمَّ اغْفِرْ لَهُمْ وَارْحَمْهُمْ وَعَافِهِمْ وَاعْفُ عَنْهُمْ. اللّٰهُمَّ أَنْزِلِ الرَّحْمَةَ وَالْمَغْفِرَةَ عَلَى أَهْلِ الْقُبُوْرِ مِنْ أَهْلِ لَا إِلٰهَ إِلَّا اللّٰهُ مُحَمَّدٌ رَسُوْلُ اللّٰهِ", latin: "Allahummaghfir lahum warhamhum wa 'afihim wa'fu 'anhum...", indo: "Ya Allah, ampunilah mereka, berilah rahmat, sejahterakanlah, dan maafkanlah kesalahan mereka. Turunkanlah rahmat dan ampunan bagi penghuni kubur." },
  { id: 6, arab: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ. سُبْحَانَ رَبِّكَ رَبِّ الْعِزَّةِ عَمَّا يَصِفُونَ وَسَلَامٌ عَلَى الْمُرْسَلِينَ وَالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", latin: "Rabbana atina fid-dunya hasanah wa fil-akhirati hasanah wa qina 'adhaban-nar. Walhamdulillahi rabbil 'alamin.", indo: "Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab neraka. Segala puji bagi Allah Tuhan Semesta Alam." }
];

export default function YasinPage() {
  const [activeTab, setActiveTab] = useState('yasin'); // 'yasin' | 'tahlil' | 'doa'
  const [fontSize, setFontSize] = useState(28);
  const [yasinAyat, setYasinAyat] = useState([]);
  const [loadingYasin, setLoadingYasin] = useState(true);

  // Ambil 83 Ayat Yasin Lengkap dari API EQuran
  useEffect(() => {
    async function fetchYasinFull() {
      try {
        setLoadingYasin(true);
        const res = await fetch('https://equran.id/api/v2/surat/36');
        const data = await res.json();
        if (data && data.data && data.data.ayat) {
          setYasinAyat(data.data.ayat);
        }
      } catch (err) {
        console.error('Gagal memuat Surah Yasin:', err);
      } finally {
        setLoadingYasin(false);
      }
    }
    fetchYasinFull();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between theme-bg-secondary theme-border p-4 rounded-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold theme-text-accent hover:opacity-80">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Utama
        </Link>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setFontSize(prev => Math.max(20, prev - 2))}
            className="p-2 theme-bg-tertiary rounded-xl theme-text-primary text-xs font-bold border theme-border flex items-center gap-1"
            title="Kecilkan Teks"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setFontSize(prev => Math.min(48, prev + 2))}
            className="p-2 theme-bg-tertiary rounded-xl theme-text-primary text-xs font-bold border theme-border flex items-center gap-1"
            title="Besarkan Teks"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="grid grid-cols-3 gap-2 p-1.5 theme-bg-secondary rounded-2xl theme-border">
        <button
          onClick={() => setActiveTab('yasin')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'yasin' 
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black' 
              : 'theme-text-secondary hover:theme-text-primary'
          }`}
        >
          Surah Yasin (83)
        </button>
        <button
          onClick={() => setActiveTab('tahlil')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tahlil' 
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black' 
              : 'theme-text-secondary hover:theme-text-primary'
          }`}
        >
          Tahlil & Dzikir
        </button>
        <button
          onClick={() => setActiveTab('doa')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'doa' 
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black' 
              : 'theme-text-secondary hover:theme-text-primary'
          }`}
        >
          Doa Haul & Arwah
        </button>
      </div>

      {/* Title Header */}
      <div className="text-center space-y-1 py-2">
        <h2 className="text-base font-black uppercase tracking-wider theme-text-primary flex items-center justify-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          {activeTab === 'yasin' && 'Surah YaSiin (Lengkap 83 Ayat)'}
          {activeTab === 'tahlil' && 'Susunan Bacaan Tahlil NU'}
          {activeTab === 'doa' && 'Doa Khusus Haul & Arwah'}
        </h2>
        <p className="text-xs theme-text-secondary font-medium">
          Standar Majelis An-Nahdliyyah (Lengkap Teks Arab, Latin, & Terjemahan)
        </p>
      </div>

      {/* TAB 1: SURAH YASIN LENGKAP 83 AYAT */}
      {activeTab === 'yasin' && (
        <div className="space-y-4">
          {loadingYasin ? (
            <div className="text-center py-12 space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs theme-text-secondary font-mono animate-pulse">Memuat 83 Ayat Surah YaSiin...</p>
            </div>
          ) : (
            yasinAyat.map((item) => (
              <div key={item.nomorAyat} className="theme-bg-secondary border theme-border p-5 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-center border-b theme-border pb-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-black flex items-center justify-center">
                    {item.nomorAyat}
                  </span>
                  <span className="text-[10px] font-mono theme-text-tertiary">Surah YaSiin : Ayat {item.nomorAyat}</span>
                </div>

                {/* Teks Arab */}
                <p 
                  className="text-right leading-loose font-serif theme-text-primary py-2"
                  style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize * 1.9}px` }}
                  dir="rtl"
                >
                  {item.teksArab}
                </p>

                {/* Transliteration & Translation */}
                <div className="space-y-1.5 pt-2 border-t theme-border">
                  <p className="text-xs font-semibold text-emerald-400 italic font-mono">
                    {item.teksLatin}
                  </p>
                  <p className="text-xs theme-text-secondary leading-relaxed">
                    "{item.teksIndonesia}"
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: TAHLIL LENGKAP */}
      {activeTab === 'tahlil' && (
        <div className="space-y-4">
          {TAHLIL_TEXT.map((item) => (
            <div key={item.id} className="theme-bg-secondary border theme-border p-5 rounded-3xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b theme-border pb-2">
                <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-black flex items-center justify-center">
                  {item.id}
                </span>
                <span className="text-[10px] font-mono theme-text-tertiary">Urutan Tahlil #{item.id}</span>
              </div>

              <p 
                className="text-right leading-loose font-serif theme-text-primary py-2"
                style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize * 1.8}px` }}
                dir="rtl"
              >
                {item.arab}
              </p>

              <div className="space-y-1.5 pt-2 border-t theme-border">
                <p className="text-xs font-semibold text-emerald-400 italic font-mono">
                  {item.latin}
                </p>
                <p className="text-xs theme-text-secondary leading-relaxed">
                  "{item.indo}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: DOA HAUL & ARWAH */}
      {activeTab === 'doa' && (
        <div className="space-y-4">
          {DOA_TEXT.map((item) => (
            <div key={item.id} className="theme-bg-secondary border theme-border p-5 rounded-3xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b theme-border pb-2">
                <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-xs font-black flex items-center justify-center">
                  {item.id}
                </span>
                <span className="text-[10px] font-mono theme-text-tertiary">Doa Haul Bagian #{item.id}</span>
              </div>

              <p 
                className="text-right leading-loose font-serif theme-text-primary py-2"
                style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize * 1.8}px` }}
                dir="rtl"
              >
                {item.arab}
              </p>

              <div className="space-y-1.5 pt-2 border-t theme-border">
                <p className="text-xs font-semibold text-emerald-400 italic font-mono">
                  {item.latin}
                </p>
                <p className="text-xs theme-text-secondary leading-relaxed">
                  "{item.indo}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
