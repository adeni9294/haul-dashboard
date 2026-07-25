'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ZoomIn, ZoomOut } from 'lucide-react';

const YASIN_TEXT = [
  { id: 1, arab: "يس ۚ", latin: "Yā-Sīn.", indo: "Ya Sin." },
  { id: 2, arab: "وَٱلْقُرْءَانِ ٱلْحَكِيمِ", latin: "Wal-qur'ānil-ḥakīm.", indo: "Demi Al-Qur'an yang penuh hikmah," },
  { id: 3, arab: "إِنَّكَ لَمِنَ ٱلْمُرْسَلِينَ", latin: "Innaka laminal-mursalīn.", indo: "Sungguh, engkau (Muhammad) adalah salah seorang dari rasul-rasul," },
  { id: 4, arab: "عَلَىٰ صِرَٰطٍ مُّسْتَقِيمٍ", latin: "‘Alā ṣirāṭim mustaqīm.", indo: "(yang berada) di atas jalan yang lurus," },
  { id: 5, arab: "تَنزِيلَ ٱلْعَزِيزِ ٱلرَّحِيمِ", latin: "Tanzīlal-‘azīzir-raḥīm.", indo: "(sebagai wahyu yang) diturunkan oleh (Allah) Yang Mahaperkasa, Maha Penyayang," },
  { id: 6, arab: "لِتُنذِرَ قَوْمًا مَّآ أُنذِرَ ءَابَآؤُهُمْ فَهُمْ غَٰفِلُونَ", latin: "Li-tundira qaumam mā undira ābā'uhum fahum gāfilūn.", indo: "Agar engkau memberi peringatan kepada suatu kaum yang nenek moyangnya belum pernah diberi peringatan, karena itu mereka lalai." }
];

const TAHLIL_TEXT = [
  { id: 1, arab: "أَسْتَغْفِرُ اللهَ الْعَظِيْمَ", latin: "Astaghfirullahal 'adzim (3x)", indo: "Aku memohon ampun kepada Allah Yang Maha Agung." },
  { id: 2, arab: "أَفْضَلُ الذِّكْرِ فَاعْلَمْ أَنَّهُ لَا إِلٰهَ إِلَّا اللهُ", latin: "Afdhaludz dzikri fa'lam annahu Lā ilāha illallāh.", indo: "Ketahuilah bahwa sebaik-baik dzikir adalah Lā ilāha illallāh." },
  { id: 3, arab: "لَا إِلٰهَ إِلَّا اللهُ", latin: "Lā ilāha illallāh (33x)", indo: "Tiada Tuhan selain Allah." },
  { id: 4, arab: "لَا إِلٰهَ إِلَّا اللهُ مُحَمَّدٌ رَسُوْلُ اللهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ", latin: "Lā ilāha illallāhu Muḥammadur Rasūlullāh ṣallallāhu 'alaihi wa sallam.", indo: "Tiada Tuhan selain Allah, Nabi Muhammad adalah utusan Allah, semoga Allah melimpahkan shalawat dan salam atasnya." }
];

const DOA_TEXT = [
  { id: 1, arab: "أَللّٰهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ", latin: "Allāhummaghfir lahū warḥamhū wa 'āfihī wa'fu 'anhū.", indo: "Ya Allah, ampunilah dia, berilah rahmat kepadanya, sejahterakanlah dia, dan maafkanlah kesalahannya." },
  { id: 2, arab: "أَللّٰهُمَّ أَنْزِلِ الرَّحْمَةَ وَالْمَغْفِرَةَ عَلَى أَهْلِ الْقُبُوْرِ مِنْ أَهْلِ لَا إِلهَ إلَّا اللهُ مُحَمَّدٌ رَسُوْلُ اللهِ", latin: "Allāhumma anzilir raḥmata wal maghfirata 'alā ahlil qubūri min ahli lā ilāha illallāhu Muḥammadur rasūlullāh.", indo: "Ya Allah, turunkanlah rahmat dan ampunan kepada ahli kubur dari kalangan ahli Lā ilāha illallāh Muḥammadur rasūlullāh." }
];

export default function YasinPage() {
  const [activeTab, setActiveTab] = useState('yasin');
  const [fontSize, setFontSize] = useState(28);

  const currentList = activeTab === 'yasin' ? YASIN_TEXT : activeTab === 'tahlil' ? TAHLIL_TEXT : DOA_TEXT;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Navigasi */}
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
            onClick={() => setFontSize(prev => Math.min(44, prev + 2))}
            className="p-2 theme-bg-tertiary rounded-xl theme-text-primary text-xs font-bold border theme-border flex items-center gap-1"
            title="Besarkan Teks"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab Menu */}
      <div className="grid grid-cols-3 gap-2 p-1.5 theme-bg-secondary rounded-2xl theme-border">
        <button
          onClick={() => setActiveTab('yasin')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'yasin' 
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black' 
              : 'theme-text-secondary hover:theme-text-primary'
          }`}
        >
          Surah Yasin
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

      <div className="text-center space-y-1 py-2">
        <h2 className="text-base font-black uppercase tracking-wider theme-text-primary">
          {activeTab === 'yasin' && '📖 Surah YaSiin (Versi An-Nahdliyyah / NU)'}
          {activeTab === 'tahlil' && '📿 Bacaan Tahlil & Istighotsah'}
          {activeTab === 'doa' && '🤲 Doa Khusus Haul & Arwah'}
        </h2>
        <p className="text-xs theme-text-secondary font-medium">
          Dilengkapi Teks Arab, Latin, dan Terjemahan Bahasa Indonesia
        </p>
      </div>

      {/* Daftar Ayat / Bacaan */}
      <div className="space-y-4">
        {currentList.map((item) => (
          <div key={item.id} className="theme-bg-secondary border theme-border p-5 rounded-3xl space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b theme-border pb-2">
              <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-black flex items-center justify-center">
                {item.id}
              </span>
              <span className="text-[10px] font-mono theme-text-tertiary">An-Nahdliyyah Standard</span>
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
    </div>
  );
}
