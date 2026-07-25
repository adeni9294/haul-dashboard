'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ZoomIn, ZoomOut, Loader2, BookOpen } from 'lucide-react';

// BACAAN TAHLIL KUBRO KASANAH GUNUNG JATI CIREBON
const TAHLIL_GUNUNGJATI = [
  { 
    id: 1, 
    arab: "إِلَى حَضْرَةِ النَّبِيِّ الْمُصْطَفَى مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ وَآلِهِ وَأَزْوَاجِهِ وَذُرِّيَّاتِهِ وَأَهْلِ بَيْتِهِ الْكِرَامِ، شَيْءٌ لِلّٰهِ لَهُمُ الْفَاتِحَةُ...", 
    latin: "Ila hadhratin-nabiyyil musthafa muhammadin sallallahu 'alaihi wasallama wa alihi wa azwajihi wa dhurriyyatihi wa ahli baitihil kiram, syai'ul lillahi lahumul fatihah...", 
    indo: "Tawasul 1: Kepada Baginda Nabi Agung Muhammad SAW, keluarga, dan ahli baitnya. (Al-Fatihah)" 
  },
  { 
    id: 2, 
    arab: "ثُمَّ إِلَى حَضَرَاتِ إِخْوَانِهِ مِنَ الأَنْبِيَاءِ وَالْمُرْسَلِيْنَ وَالأَوْلِيَاءِ وَالشُّهَدَاءِ وَالصَّالِحِيْنَ وَالصَّحَابَةِ وَالتَّابِعِيْنَ وَالْعُلَمَاءِ الْعَامِلِيْنَ وَالْمُصَنِّفِيْنَ الْمُخْلِصِيْنَ وَجَمِيْعِ الْمَلَائِكَةِ الْمُقَرَّبِيْنَ، خُصُوْصًا سَيِّدَنَا الشَّيْخَ عَبْدَ القَادِرِ الجَيْلَانِيّ، شَيْءٌ لِلّٰهِ لَهُمُ الْفَاتِحَةُ...", 
    latin: "Thumma ila hadharati ikhwanihi minal anbiya'i wal mursalin... khususan Sayyidanasy-Syaikh 'Abdul Qadir Al-Jilani...", 
    indo: "Tawasul 2: Para Nabi, Wali, Syuhada, dan Syekh Abdul Qadir Al-Jilani. (Al-Fatihah)" 
  },
  { 
    id: 3, 
    arab: "ثُمَّ إِلَى حَضَرَاتِ أَوْلِيَاءِ اللّٰهِ التِّسْعَةِ (وَلِي سَڠَا)، وَخُصُوْصًا إِلَى حَضْرَةِ سُلْطَانِ أَوْلِيَاءِ كَارُبَانِ سَيِّدِنَا شَرِيْفِ هِدَايَتِ اللّٰهِ (سُنَنْ ݢُونُونْ ݢَاتِي) وَأُصُوْلِهِ وَفُرُوْعِهِ، وَسَيِّدِنَا شَيْخِ كَهْفِي (شَيْخِ ذَاتِي كُهْنِي)، وَسَيِّدِي الشَّيْخِ نُورِ الدِّينِ إِبْرَاهِيمَ (مَوْلَانَا بَاسَ بَانْتَن)، وَالْحَاجِّ تَنُوكَسُومَا، وَجَمِيْعِ مَشَايِخِ ثَغْرِ جِرِبُونَ، شَيْءٌ لِلّٰهِ لَهُمُ الْفَاتِحَةُ...", 
    latin: "Thumma ila hadharati auliya'illahit-tis'ah (Wali Sanga), wa khususan ila hadhrati Sultani Auliya'i Karuban Sayyidina Syarif Hidayatullah (Sunan Gunung Jati)... wa Syekh Datul Kahfi... wa jami'i masyayikhi tsaghri Cirebon...", 
    indo: "Tawasul Khusus Cirebon: Wali Sanga, Kanjeng Sunan Gunung Jati (Syarif Hidayatullah), Syekh Datul Kahfi, Sultan Banten, serta Seluruh Masyayikh Tanah Cirebon. (Al-Fatihah)" 
  },
  { 
    id: 4, 
    arab: "ثُمَّ إِلَى أَرْوَاحِ جَمِيْعِ أَهْلِ القُبُوْرِ مِنَ المُسْلِمِيْنَ وَالمُسْلِمَاتِ وَالمُؤْمِنِيْنَ وَالمُؤْمِنَاتِ، خُصُوْصًا إِلَى آبَائِنَا وَأُمَّهَاتِنَا وَأَجْدَادِنَا وَجَدَّاتِنَا، وَخُصُوْصًا إِلَى صَاحِبِ هٰذِهِ المَقْبَرَةِ (بُويُوت كِبُوه وَبُويُوت بِسُوس) وَكَافَّةِ أَهْلِ القُبُوْرِ مِنْ اَهْلِ هٰذِهِ القَرْيَةِ (وَارُوْجَايَا/جِبُوغُوْ)، شَيْءٌ لِلّٰهِ لَهُمُ الْفَاتِحَةُ...", 
    latin: "Thumma ila arwahi jami'i ahlil quburi... wa khususan ila sahibi hadhihil maqbarah (Buyut Kepuh & Buyut Besus)... lahumul fatihah...", 
    indo: "Tawasul Ahli Kubur: Khususon Pembuka Maqbaroh Buyut Kepuh & Buyut Besus serta Leluhur Desa Warujaya/Cibogo. (Al-Fatihah)" 
  },
  { 
    id: 5, 
    arab: "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ. قُلْ هُوَ اللّٰهُ أَحَدٌ. اللّٰهُ الصَّمَدُ. لَمْ يَلِدْ وَلَمْ يُولَدْ. وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ (٣x)", 
    latin: "Surah Al-Ikhlas (3x)", 
    indo: "Surah Al-Ikhlas 3 kali." 
  },
  { 
    id: 6, 
    arab: "لَا إِلٰهَ إِلَّا اللّٰهُ وَاللّٰهُ أَكْبَرُ، وَلِلّٰهِ الْحَمْدُ", 
    latin: "La ilaha illallahu wallahu akbar, walillahil hamd", 
    indo: "Tahlil & Takbir." 
  },
  { 
    id: 7, 
    arab: "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ. قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ...", 
    latin: "Surah Al-Falaq", 
    indo: "Membaca Surah Al-Falaq." 
  },
  { 
    id: 8, 
    arab: "لَا إِلٰهَ إِلَّا اللّٰهُ وَاللّٰهُ أَكْبَرُ، وَلِلّٰهِ الْحَمْدُ", 
    latin: "La ilaha illallahu wallahu akbar, walillahil hamd", 
    indo: "Tahlil & Takbir." 
  },
  { 
    id: 9, 
    arab: "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ. قُلْ أَعُوذُ بِرَبِّ النَّاسِ...", 
    latin: "Surah An-Nas", 
    indo: "Membaca Surah An-Nas." 
  },
  { 
    id: 10, 
    arab: "لَا إِلٰهَ إِلَّا اللّٰهُ وَاللّٰهُ أَكْبَرُ، وَلِلّٰهِ الْحَمْدُ", 
    latin: "La ilaha illallahu wallahu akbar, walillahil hamd", 
    indo: "Tahlil & Takbir." 
  },
  { 
    id: 11, 
    arab: "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ. الْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِيْنَ. الرَّحْمٰنِ الرَّحِيْمِ. مَالِكِ يَوْمِ الدِّيْنِ. إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِيْنُ. اهْدِنَا الصِّرَاطَ الْمُسْتَقِيْمَ. صِرَاطَ الَّذِيْنَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوْبِ عَلَيْهِمْ وَلَا الضَّالِّيْنَ. آمِيْن", 
    latin: "Surah Al-Fatihah", 
    indo: "Surah Al-Fatihah." 
  },
  { 
    id: 12, 
    arab: "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ. الم. ذٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيْهِ ۛ هُدًى لِلْمُتَّقِيْنَ...", 
    latin: "Surah Al-Baqarah: 1-5", 
    indo: "Awal Surah Al-Baqarah." 
  },
  { 
    id: 13, 
    arab: "وَإِلٰهُكُمْ إِلٰهٌ وَاحِدٌ ۖ لَا إِلٰهَ إِلَّا هُوَ الرَّحْمٰنُ الرَّحِيْمُ", 
    latin: "Wa ilahukum ilahun wahid...", 
    indo: "Ayat Tauhid." 
  },
  { 
    id: 14, 
    arab: "اللّٰهُ لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...", 
    latin: "Ayat Kursi (Al-Baqarah: 255)", 
    indo: "Ayat Kursi." 
  },
  { 
    id: 15, 
    arab: "لِلّٰهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ... وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا (٧x) أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ", 
    latin: "Lillahi ma fis-samawati... Wa'fu 'anna waghfir lana warhamna (7x)", 
    indo: "Akhir Al-Baqarah & Permohonan Rahmat (7x)." 
  },
  { 
    id: 16, 
    arab: "يَا أَرْحَمَ الرَّاحِمِيْنَ إِرْحَمْنَا (٧x)", 
    latin: "Ya Arhamar-rahimina irhamna (7x)", 
    indo: "Istighotsah Rahmat khas Keraton Gunung Jati." 
  },
  { 
    id: 17, 
    arab: "اللّٰهُمَّ صَلِّ صَلَاةً كَامِلَةً وَسَلِّمْ سَلَامًا تَامًّا عَلَى سَيِّدِنَا مُحَمَّدٍ الَّذِي تَنْحَلُّ بِهِ الْعُقَدُ وَتَنْفَرِجُ بِهِ الْكُرَبُ وَتُقْضَى بِهِ الْحَوَائِجُ وَتُنَالُ بِهِ الرَّغَائِبُ وَحُسْنُ الْخَوَاتِمِ وَيُسْتَسْقَى الْغَمَامُ بِوَجْهِهِ الْكَرِيْمِ وَعَلَى آلِهِ وَصَحْبِهِ فِي كُلِّ لَمْحَةٍ وَنَفَسٍ بِعَدَدِ كُلِّ مَعْلُوْمٍ لَكَ", 
    latin: "Shalawat Nariyah / Tafrijiyyah", 
    indo: "Membaca Shalawat Nariyah." 
  },
  { 
    id: 18, 
    arab: "أَسْتَغْفِرُ اللّٰهَ الْعَظِيْمَ (٣٣x)", 
    latin: "Astaghfirullahal 'Adzim (33x)", 
    indo: "Istighfar." 
  },
  { 
    id: 19, 
    arab: "أَفْضَلُ الذِّكْرِ فَاعْلَمْ أَنَّهُ لَا إِلٰهَ إِلَّا اللهُ، حَيٌّ مَوْجُوْدٌ. لَا إِلٰهَ إِلَّا اللهُ، حَيٌّ مَعْبُوْدٌ. لَا إِلٰهَ إِلَّا اللهُ، حَيٌّ بَاقٍ الَّذِي لَا يَمُوْتُ", 
    latin: "Afdhaludz-dzikri fa'lam annahu la ilaha illallah...", 
    indo: "Pengantar Tahlil Utama." 
  },
  { 
    id: 20, 
    arab: "لَا إِلٰهَ إِلَّا اللهُ (١٠٠x)", 
    latin: "Lā ilāha illallāh (100x / Berjamaah)", 
    indo: "Dzikir Tahlil Utama." 
  },
  { 
    id: 21, 
    arab: "لَا إِلٰهَ إِلَّا اللهُ مُحَمَّدٌ رَسُوْلُ اللهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، كَلِمَةُ حَقٍّ عَلَيْهَا نَحْيَا وَعَلَيْهَا نَمُوْتُ وَبِهَا نُبْعَثُ إِنْ شَاءَ اللّٰهُ تَعَالَى مِنَ الْآمِنِيْنَ. بِرَحْمَتِكَ يَا أَرْحَمَ الرَّاحِمِيْنَ", 
    latin: "La ilaha illallahu muhammadur rasulullahi sallallahu 'alaihi wa sallam...", 
    indo: "Penutup Tahlil Khas Gunung Jati." 
  }
];

// DOA HAUL KUBRO KERATON / GUNUNG JATI CIREBON
const DOA_GUNUNGJATI = [
  { 
    id: 1, 
    arab: "أَعُوْذُ بِاللهِ مِنَ الشَّيْطَانِ الرَّجِيْمِ. بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ. الْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِيْنَ حَمْدَ الشَّاكِرِيْنَ حَمْدَ النَّاعِمِيْنَ حَمْدًا يُوَافِي نِعَمَهُ وَيُكَافِئُ مَزِيْدَهُ. يَا رَبَّنَا لَكَ الْحَمْدُ كَمَا يَنْبَغِي لِجَلَالِ وَجْهِكَ وَلِعَظِيْمِ سُلْطَانِكَ. أَللّٰهُمَّ صَلِّ وَسَلِّمْ عَلَى سَيِّدِنَا مُحَمَّدٍ فِي الْأَوَّلِيْنَ وَالْآخِرِيْنَ وَفِي الْمَلَإِ الْأَعْلَى إِلَى يَوْمِ الدِّيْنِ", 
    latin: "Alhamdulillahi rabbil 'alamin... Allahumma salli wa sallim 'ala sayyidina muhammadin fil awwalina wal akhirin...", 
    indo: "Mukadimah Hamdalah & Shalawat Agung." 
  },
  { 
    id: 2, 
    arab: "أَللّٰهُمَّ تَقَبَّلْ وَأَوْصِلْ ثَوَابَ مَا قَرَأْنَاهُ مِنْ كِتَابِكَ الْعَظِيْمِ (سُوْرَةِ يس) وَمَا هَلَّلْنَاهُ وَمَا سَبَّحْنَاهُ وَمَا اسْتَغْفَرْنَاهُ وَمَا صَلَّيْنَاهُ عَلَى سَيِّدِنَا مُحَمَّدٍ هَدِيَّةً مَقْبُوْلَةً وَرَحْمَةً نَازِلَةً وَبَرَكَةً شَامِلَةً إِلَى حَضَرَةِ النَّبِيِّ الْمُصْطَفَى مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، وَإِلَى أَرْوَاحِ أَوْلِيَاءِ اللّٰهِ كَافَّةً، وَخُصُوْصًا إِلَى حَضْرَةِ سُلْطَانِ أَوْلِيَاءِ كَارُبَانِ سَيِّدِنَا شَرِيْفِ هِدَايَتِ اللّٰهِ (سُنَنْ ݢُونُونْ ݢَاتِي) وَإِلَى أَرْوَاحِ سَائِرِ أَوْلِيَاءِ سَبْعَةِ وَأَوْلِيَاءِ تِسْعَةِ فِي طَبَقَاتِ هٰذِهِ الْأَرْضِ", 
    latin: "Allahumma taqabbal wa awsil thawaba ma qara'nahu... khususan ila hadhrati Sultani Auliya'i Karuban Sayyidina Syarif Hidayatullah (Sunan Gunung Jati)...", 
    indo: "Permohonan Sampainya Pahala Yasin & Tahlil Khususon Kanjeng Sunan Gunung Jati & Wali Sanga." 
  },
  { 
    id: 3, 
    arab: "ثُمَّ إِلَى أَرْوَاحِ جَمِيْعِ أَهْلِ الْقُبُوْرِ مِنَ الْمُسْلِمِيْنَ وَالْمُسْلِمَاتِ مِنْ مَشَارِقِ الْأَرْضِ إِلَى مَغَارِبِهَا، وَخُصُوْصًا إِلَى أَرْوَاحِ صَاحِبِ هٰذِهِ الْمَقْبَرَةِ الْمُبَارَكَةِ (بُويُوت كِبُوه وَبُويُوت بِسُوس) وَإِلَى أَرْوَاحِ آبَائِنَا وَأُمَّهَاتِنَا وَأَجْدَادِنَا وَجَدَّاتِنَا وَمَشَايِخِنَا وَأَهْلِ بَلَدَتِنَا هٰذِهِ", 
    latin: "Thumma ila arwahi jami'i ahlil quburi... wa khususan ila arwahi Buyut Kepuh & Buyut Besus...", 
    indo: "Pengkhususan Doa untuk Ahli Kubur Maqbaroh Buyut Kepuh & Buyut Besus serta Seluruh Leluhur Desa." 
  },
  { 
    id: 4, 
    arab: "أَللّٰهُمَّ اغْفِرْ لَهُمْ وَارْحَمْهُمْ وَعَافِهِمْ وَاعْفُ عَنْهُمْ. أَللّٰهُمَّ أَنْزِلِ الرَّحْمَةَ وَالْمَغْفِرَةَ وَالرِّضْوَانَ عَلَى أَهْلِ الْقُبُوْرِ مِنْ أَهْلِ لَا إِلٰهَ إِلَّا اللّٰهُ مُحَمَّدٌ رَسُوْلُ اللّٰهِ. أَللّٰهُمَّ اجْعَلْ قُبُوْرَهُمْ رَوْضَةً مِنْ رِيَاضِ الْجِنَانِ وَلَا تَجْعَلْ قُبُوْرَهُمْ حُفْرَةً مِنْ حُفَرِ النِّيْرَانِ", 
    latin: "Allahummaghfir lahum warhamhum... Allahummaj'al quburahum raudhatan min riyadhil jinan...", 
    indo: "Doa Ampunan & Permohonan Taman Surga bagi Ahli Kubur." 
  },
  { 
    id: 5, 
    arab: "أَللّٰهُمَّ ادْفَعْ عَنَّا الْبَلَاءَ وَالْوَبَاءَ وَالزَّلَازِلَ وَالْمِحَنَ وَسُوْءَ الْفِتْنَةِ مَا ظَهَرَ مِنْهَا وَمَا بَطَنَ عَنْ بَلَدِنَا جِرِبُونَ خَاصَّةً وَعَنْ سَائِرِ بُلْدَانِ الْمُسْلِمِيْنَ عَامَّةً يَا رَبَّ الْعَالَمِيْنَ. أَللّٰهُمَّ اجْعَلْ بَلْدَتَنَا هٰذِهِ بَلْدَةً طَيِّبَةً آمِنَةً مُطْمَئِنَّةً وَسَائِرَ بِلَادِ الْمُسْلِمِيْنَ", 
    latin: "Allahummadfa' 'annal bala'a... wa 'an baladina Cirebon khassatan...", 
    indo: "Doa Penolak Bencana & Keselamatan untuk Wilayah Cirebon & Seluruh Jemaah." 
  },
  { 
    id: 6, 
    arab: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ. سُبْحَانَ رَبِّكَ رَبِّ الْعِزَّةِ عَمَّا يَصِفُونَ وَسَلَامٌ عَلَى الْمُرْسَلِينَ وَالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ. سُوْرَةُ الْفَاتِحَة...", 
    latin: "Rabbana atina fid-dunya hasanah... Walhamdulillahi rabbil 'alamin. Al-Fatihah...", 
    indo: "Penutup Doa Sapu Jagat & Fatihah Penutup." 
  }
];

export default function YasinPage() {
  const [activeTab, setActiveTab] = useState('yasin'); // 'yasin' | 'tahlil' | 'doa'
  const [fontSize, setFontSize] = useState(28);
  const [yasinAyat, setYasinAyat] = useState([]);
  const [loadingYasin, setLoadingYasin] = useState(true);

  // Fetch 83 Ayat Surah Yasin
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
          Tahlil Gunung Jati
        </button>
        <button
          onClick={() => setActiveTab('doa')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'doa' 
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black' 
              : 'theme-text-secondary hover:theme-text-primary'
          }`}
        >
          Doa Haul Cirebon
        </button>
      </div>

      {/* Title Header */}
      <div className="text-center space-y-1 py-2">
        <h2 className="text-base font-black uppercase tracking-wider theme-text-primary flex items-center justify-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          {activeTab === 'yasin' && 'Surah YaSiin (Lengkap 83 Ayat)'}
          {activeTab === 'tahlil' && 'Tahlil Kubro Versi Kanjeng Sunan Gunung Jati'}
          {activeTab === 'doa' && 'Doa Haul Keraton / Masyayikh Cirebon'}
        </h2>
        <p className="text-xs theme-text-secondary font-medium">
          Tradisi Khas Pesantren & Keraton Cirebon (Teks Arab Utuh, Latin, & Terjemahan)
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

      {/* TAB 2: TAHLIL KASANAH GUNUNG JATI */}
      {activeTab === 'tahlil' && (
        <div className="space-y-4">
          {TAHLIL_GUNUNGJATI.map((item) => (
            <div key={item.id} className="theme-bg-secondary border theme-border p-5 rounded-3xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b theme-border pb-2">
                <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-black flex items-center justify-center">
                  {item.id}
                </span>
                <span className="text-[10px] font-mono theme-text-tertiary">Urutan Tahlil Gunung Jati #{item.id}</span>
              </div>

              <p 
                className="text-right leading-loose font-serif theme-text-primary py-2"
                style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize * 1.9}px` }}
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

      {/* TAB 3: DOA HAUL GUNUNG JATI CIREBON */}
      {activeTab === 'doa' && (
        <div className="space-y-4">
          {DOA_GUNUNGJATI.map((item) => (
            <div key={item.id} className="theme-bg-secondary border theme-border p-5 rounded-3xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b theme-border pb-2">
                <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-xs font-black flex items-center justify-center">
                  {item.id}
                </span>
                <span className="text-[10px] font-mono theme-text-tertiary">Doa Haul Cirebon #{item.id}</span>
              </div>

              <p 
                className="text-right leading-loose font-serif theme-text-primary py-2"
                style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize * 1.9}px` }}
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
