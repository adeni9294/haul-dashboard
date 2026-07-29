'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ZoomIn, ZoomOut, Loader2, BookOpen } from 'lucide-react';

// BACAAN TAHLIL KUBRO SESUAI URUTAN MAJMU' SYARIF / PESANTREN
const TAHLIL_GUNUNGJATI = [
  // --- 1. TAWASSUL ---
  { 
    id: 1, 
    arab: "إِلَى حَضْرَةِ النَّبِيِّ الْمُصْطَفَى مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ وَآلِهِ وَأَزْوَاجِهِ وَذُرِّيَّاتِهِ وَأَهْلِ بَيْتِهِ الْكِرَامِ، شَيْءٌ لِلّٰهِ لَهُمُ الْفَاتِحَةُ...", 
    latin: "Ila hadhratin-nabiyyil musthafa muhammadin sallallahu 'alaihi wasallama wa alihi wa azwajihi wa dhurriyyatihi wa ahli baitihil kiram, syai'ul lillahi lahumul fatihah...", 
    indo: "Tawasul 1: Kepada Baginda Nabi Agung Muhammad SAW, keluarga, dan ahli baitnya. (Al-Fatihah)" 
  },
  { 
    id: 2, 
    arab: "ثُمَّ إِلَى حَضَرَاتِ إِخْوَانِهِ مِنَ الأَنْبِيَاءِ وَالْمُرْسَلِيْنَ وَالأَوْلِيَاءِ وَالشُّهَدَاءِ وَالصَّالِحِيْنَ وَالصَّحَابَةِ وَالتَّابِعِيْنَ وَالْعُلَمَاءِ الْعَامِلِيْنَ وَالْمُصَنِّفِيْنَ الْمُخْلِصِيْنَ وَجَمِيْعِ الْمَلَائِكَةِ الْمُقَرَّبِيْنَ، خُصُوْصًا سَيِّدَنَا الشَّيْخَ عَبْدَ القَادِرِ الجَيْلَانِيّ، شَيْءٌ لِلّٰهِ لَهُمُ الْفَاتِحَةُ...", 
    latin: "Thumma ila hadharati ikhwanihi minal anbiya'i wal mursalin... khususan Sayyidanasy-Syaikh 'Abdul Qadir Al-Jilani...", 
    indo: "Tawasul 2: Para Nabi, Wali, Syuhada, dan Syekh Abdul Qadir Al-Jilani. (Al-Fatihah)" 
  },
  { 
    id: 3, 
    arab: "ثُمَّ إِلَى حَضَرَاتِ أَوْلِيَاءِ اللّٰهِ التِّسْعَةِ (وَلِي سَڠَا)، وَخُصُوْصًا إِلَى حَضْرَةِ سُلْطَانِ أَوْلِيَاءِ كَارُبَانِ سَيِّدِنَا شَرِيْفِ هِدَايَتِ اللّٰهِ (سُنَنْ ݢُونُونْ ݢَاتِي) وَأُصُوْلِهِ وَفُرُوْعِهِ، وَسَيِّدِنَا شَيْخِ كَهْفِي (شَيْخِ ذَاتِي كُهْنِي)، وَسَيِّدِي الشَّيْخِ نُورِ الدِّينِ إِبْرَاهِيمَ (مَوْلَانَا بَاسَ بَانْتَن)، وَالْحَاجِّ تَنُوكَسُومَا، وَجَمِيْعِ مَشَايِخِ ثَغْرِ جِرِبُونَ، شَيْءٌ لِلّٰهِ لَهُمُ الْفَاتِحَةُ...", 
    latin: "Thumma ila hadharati auliya'illahit-tis'ah (Wali Sanga), wa khususan ila hadhrati Sultani Auliya'i Karuban Sayyidina Syarif Hidayatullah (Sunan Gunung Jati)... wa Syekh Datul Kahfi... wa jami'i masyayikhi tsaghri Cirebon...", 
    indo: "Tawasul Khusus Cirebon: Wali Sanga, Kanjeng Sunan Gunung Jati (Syarif Hidayatullah), Syekh Datul Kahfi, Sultan Banten, serta Seluruh Masyayikh Tanah Cirebon. (Al-Fatihah)" 
  },
  { 
    id: 4, 
    arab: "ثُمَّ إِلَى أَرْوَاحِ جَمِيْعِ أَهْلِ القُبُوْرِ مِنَ المُسْلِمِيْنَ وَالمُسْلِمَاتِ وَالمُؤْمِنِيْنَ وَالمُؤْمِنَاتِ، خُصُوْصًا إِلَى آبَائِنَا وَأُمَّهَاتِنَا وَأَجْدَادِنَا وَجَدَّاتِنَا، وَخُصُوْصًا إِلَى صَاحِبِ هٰذِهِ المَقْبَرَةِ (بُويُوت كِبُوه وَبُويُوت بِسُوس) وَكَافَّةِ أَهْلِ القُبُوْرِ مِنْ اَهْلِ هٰذِهِ القَرْيَةِ (وَارُوْجَايَا/جِبُوغُوْ)، شَيْءٌ لِلّٰهِ لَهُمُ الْفَاتِحَةُ...", 
    latin: "Thumma ila arwahi jami'i ahlil quburi... wa khususan ila sahibi hadhihil maqbarah (Buyut Kepuh & Buyut Besus)... lahumul fatihah...", 
    indo: "Tawasul Ahli Kubur: Khususon Pembuka Maqbaroh Buyut Kepuh & Buyut Besus serta Leluhur Desa Warujaya/Cibogo. (Al-Fatihah)" 
  },

  // --- 2. AYAT-AYAT PILIHAN ---
  { 
    id: 5, 
    arab: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ \n قُلْ هُوَ اللّٰهُ أَحَدٌ ۚ اللّٰهُ الصَّمَدُ ۚ لَمْ يَلِدْ وَلَمْ يُولَدْ ۙ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ (٣x)", 
    latin: "Bismillahir-rahmanir-rahim. Qul huwallahu ahad. Allahus-samad. Lam yalid wa lam yulad. Wa lam yakul lahu kufuwan ahad. (3x)", 
    indo: "Surah Al-Ikhlas (3x)." 
  },
  { 
    id: 6, 
    arab: "لَا إِلٰهَ إِلَّا اللّٰهُ وَاللّٰهُ أَكْبَرُ، وَلِلّٰهِ الْحَمْدُ", 
    latin: "La ilaha illallahu wallahu akbar, walillahil hamd", 
    indo: "Tahlil & Takbir." 
  },
  { 
    id: 7, 
    arab: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ \n قُلْ أَعُوْذُ بِرَبِّ الْفَلَقِ ۙ مِنْ شَرِّ مَا خَلَقَ ۙ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۙ وَمِنْ شَرِّ النَّفّٰثٰتِ فِي الْعُقَدِ ۙ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ", 
    latin: "Bismillahir-rahmanir-rahim. Qul a'udzu birabbil-falaq. Min syarri ma khalaq. Wa min syarri ghasiqin idza waqab. Wa min syarrin-naffatsati fil-'uqad. Wa min syarri hasidin idza hasad.", 
    indo: "Surah Al-Falaq Lengkap." 
  },
  { 
    id: 8, 
    arab: "لَا إِلٰهَ إِلَّا اللّٰهُ وَاللّٰهُ أَكْبَرُ، وَلِلّٰهِ الْحَمْدُ", 
    latin: "La ilaha illallahu wallahu akbar, walillahil hamd", 
    indo: "Tahlil & Takbir." 
  },
  { 
    id: 9, 
    arab: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ \n قُلْ أَعُوْذُ بِرَبِّ النَّاسِ ۙ مَلِكِ النَّاسِ ۙ إِلٰهِ النَّاسِ ۙ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۖ الَّذِيْ يُوَسْوِسُ فِيْ صُدُوْرِ النَّاسِ ۙ مِنَ الْجِنَّةِ وَالنَّاسِ", 
    latin: "Bismillahir-rahmanir-rahim. Qul a'udzu birabbin-nas. Malikin-nas. Ilahin-nas. Min syarril-waswasil-khannas. Alladzi yuwaswisu fi sudurin-nas. Minal-jinnati wan-nas.", 
    indo: "Surah An-Nas Lengkap." 
  },
  { 
    id: 10, 
    arab: "لَا إِلٰهَ إِلَّا اللّٰهُ وَاللّٰهُ أَكْبَرُ، وَلِلّٰهِ الْحَمْدُ", 
    latin: "La ilaha illallahu wallahu akbar, walillahil hamd", 
    indo: "Tahlil & Takbir." 
  },
  { 
    id: 11, 
    arab: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ \n الْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِيْنَ ۙ الرَّحْمٰنِ الرَّحِيْمِ ۙ مٰلِكِ يَوْمِ الدِّيْنِ ۗ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِيْنُ ۗ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيْمَ ۙ صِرَاطَ الَّذِيْنَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوْبِ عَلَيْهِمْ وَلَا الضَّآلِّيْنَ 🤲 آمِيْن", 
    latin: "Bismillahir-rahmanir-rahim. Al-hamdu lillahi rabbil-'alamin. Ar-rahmanir-rahim. Maliki yaumid-din. Iyyaka na'budu wa iyyaka nasta'in. Ihdinas-siratal-mustaqim. Siratalladzina an'amta 'alaihim ghairil-maghdubi 'alaihim wa lad-dallin. Amin.", 
    indo: "Surah Al-Fatihah Lengkap." 
  },
  { 
    id: 12, 
    arab: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ \n الم ۚ ذٰلِكَ الْكِتٰبُ لَا رَيْبَ ۛ فِيْهِ ۛ هُدًى لِّلْمُتَّقِيْنَ ۙ الَّذِيْنَ يُؤْمِنُوْنَ بِالْغَيْبِ وَيُقِيْمُوْنَ الصَّلٰوةَ وَمِمَّا رَزَقْنٰهُمْ يُنْفِقُوْنَ ۙ وَالَّذِيْنَ يُؤْمِنُوْنَ بِمَآ أُنْزِلَ إِلَيْكَ وَمَآ أُنْزِلَ مِنْ قَبْلِكَ ۚ وَبِالْاٰخِرَةِ هُمْ يُوْقِنُوْنَ ۗ أُولٰۤئِكَ عَلٰى هُدًى مِّنْ رَّبِّهِمْ ۙ وَأُولٰۤئِكَ هُمُ الْمُفْلِحُوْنَ", 
    latin: "Alif-Lam-Mim. Dzalikal-kitabu la raiba fih, hudal lil-muttaqin. Alladzina yu'minuna bil-ghaibi wa yuqimunas-salata wa mimma razaqnahum yunfiqun. Walladzina yu'minuna bima unzila ilaika wa ma unzila min qablika wa bil-akhirati hum yuqinun. Ula'ika 'ala hudam mir rabbihim wa ula'ika humul-muflihun.", 
    indo: "Awal Surah Al-Baqarah (Ayat 1-5)." 
  },
  { 
    id: 13, 
    arab: "وَإِلٰهُكُمْ إِلٰهٌ وَّاحِدٌ ۚ لَآ إِلٰهَ إِلَّا هُوَ الرَّحْمٰنُ الرَّحِيْمُ", 
    latin: "Wa ilahukum ilahuw wahid, la ilaha illa huwar-rahmanur-rahim.", 
    indo: "Ayat Tauhid (Al-Baqarah: 163)." 
  },
  { 
    id: 14, 
    arab: "اللّٰهُ لَآ إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّوْمُ ۚ لَا تَأْخُذُهُ سِنَةٌ وََّلَا نَوْمٌ ۗ لَهُ مَا فِي السَّمٰوٰتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِيْ يَشْفَعُ عِنْدَهُ أِلَّا بِإِذْنِهِ ۗ يَعْلَمُ مَا بَيْنَ أَيْدِيْهِمْ وَمَا خَلْفَهُمْ ۚ وَلَا يُحِيْطُوْنَ بِشَيْءٍ مِّنْ عِلْمِهِ أِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمٰوٰتِ وَالْأَرْضَ ۚ وَلَا يَؤُوْدُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيْمُ", 
    latin: "Allahula ilaha illa huwal-hayyul-qayyum, la ta'khudzuhu sinatuw wa la naum...", 
    indo: "Ayat Kursi Lengkap (Al-Baqarah: 255)." 
  },
  { 
    id: 15, 
    arab: "لِلّٰهِ مَا فِي السَّمٰوٰتِ وَمَا فِي الْأَرْضِ ۗ وَإِنْ تُبْدُوْا مَا فِيْ أَنْفُسِكُمْ أَوْ تُخْفُوْهُ يُحَاسِبْكُمْ بِهِ اللّٰهُ ۗ فَيَغْفِرُ لِمَنْ يَّشَآءُ وَيُعَذِّبُ مَنْ يَّشَآءُ ۗ وَاللّٰهُ عَلٰى كُلِّ شَيْءٍ قَدِيْرٌ \n\n آمَنَ الرَّسُوْلُ بِمَآ أُنْزِلَ إِلَيْهِ مِنْ رَّبِّهِ وَالْمُؤْمِنُوْنَ ۗ كُلٌّ آمَنَ بِاللّٰهِ وَمَلٰۤئِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ ۗ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّنْ رُّسُلِهِ ۚ وَقَالُوْا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيْرُ \n\n لَا يُكَلِّفُ اللّٰهُ نَفْسًا أِلَّا وُسْعَهَا ۗ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَآ إِنْ نَّسِيْنَآ أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَآ إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِيْنَ مِنْ قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا (٧x) أَنْتَ مَوْلٰىنَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكٰفِرِيْنَ", 
    latin: "Lillahi ma fis-samawati wa ma fil-ardz... Wa'fu 'anna waghfir lana warhamna (7x) anta maulana fansurna 'alal-qaumil-kafirin.", 
    indo: "Akhir Al-Baqarah (Ayat 284-286) & Permohonan Rahmat (7x)." 
  },

  // --- 3. ISTIGHFAR ---
  { 
    id: 16, 
    arab: "أَسْتَغْفِرُ اللّٰهَ الْعَظِيْمَ (٣٣x)", 
    latin: "Astaghfirullahal 'Adzim (33x)", 
    indo: "Membaca Istighfar 33 kali." 
  },

  // --- 4. SHOLAWAT ---
  { 
    id: 17, 
    arab: "اللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ (٣x) \n\n اللّٰهُمَّ صَلِّ صَلَاةً كَامِلَةً وَسَلِّمْ سَلَامًا تَامًّا عَلَى سَيِّدِنَا مُحَمَّدٍ الَّذِي تَنْحَلُّ بِهِ الْعُقَدُ وَتَنْفَرِجُ بِهِ الْكُرَبُ وَتُقْضَى بِهِ الْحَوَائِجُ وَتُنَالُ بِهِ الرَّغَائِبُ وَحُسْنُ الْخَوَاتِمِ وَيُسْتَسْقَى الْغَمَامُ بِوَجْهِهِ الْكَرِيْمِ وَعَلَى آلِهِ وَصَحْبِهِ فِي كُلِّ لَمْحَةٍ وَنَفَسٍ بِعَدَدِ كُلِّ مَعْلُوْمٍ لَكَ", 
    latin: "Allahumma shalli 'ala sayyidina muhammadin wa 'ala ali sayyidina muhammad (3x)... Shalawat Nariyah", 
    indo: "Membaca Shalawat Nabi & Shalawat Nariyah." 
  },

  // --- 5. TASBIH ---
  { 
    id: 18, 
    arab: "سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ سُبْحَانَ اللّٰهِ الْعَظِيْمِ (٣٣x)", 
    latin: "Subhanallahi wa bihamdihi subhanallahil 'adzim (33x)", 
    indo: "Membaca Tasbih 33 kali." 
  },

  // --- 6. MEMBACA KALIMAT THAYYIBAH (ZIKIR TAHLIL) ---
  { 
    id: 19, 
    arab: "أَفْضَلُ الذِّكْرِ فَاعْلَمْ أَنَّهُ لَا إِلٰهَ إِلَّا اللهُ، حَيٌّ مَوْجُوْدٌ \n لَا إِلٰهَ إِلَّا اللهُ، حَيٌّ مَعْبُوْدٌ \n لَا إِلٰهَ إِلَّا اللهُ، حَيٌّ بَاقٍ الَّذِي لَا يَمُوْتُ", 
    latin: "Afdhaludz-dzikri fa'lam annahu la ilaha illallah, hayyun maujud. La ilaha illallah, hayyun ma'bud. La ilaha illallah, hayyun baqin alladzi la yamut.", 
    indo: "Pengantar Tahlil Utama." 
  },
  { 
    id: 20, 
    arab: "لَا إِلٰهَ إِلَّا اللهُ (٣٣x / ١٠٠x)", 
    latin: "Laa ilaaha illallaah (33x / 100x)", 
    indo: "Membaca Kalimat Thayyibah (Dzikir Tahlil)." 
  },
  { 
    id: 21, 
    arab: "لَا إِلٰهَ إِلَّا اللهُ مُحَمَّدٌ رَسُوْلُ اللهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، كَلِمَةُ حَقٍّ عَلَيْهَا نَحْيَا وَعَلَيْهَا نَمُوْتُ وَبِهَا نُبْعَثُ إِنْ شَاءَ اللّٰهُ تَعَالَى مِنَ الْآمِنِيْنَ. بِرَحْمَتِكَ يَا أَرْحَمَ الرَّاحِمِيْنَ", 
    latin: "La ilaha illallahu muhammadur rasulullahi sallallahu 'alaihi wa sallam, kalimatuh haqqin 'alaiha nahya wa 'alaiha namutu...", 
    indo: "Penutup Dzikir Tahlil." 
  }
];

// --- 7. DOA TAHLIL LENGKAP KASANAH MAJMU' SYARIF / GUNUNG JATI CIREBON ---
const DOA_GUNUNGJATI = [
  { 
    id: 1, 
    arab: "أَعُوْذُ بِاللهِ مِنَ الشَّيْطَانِ الرَّجِيْمِ. بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ. الْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِيْنَ حَمْدَ الشَّاكِرِيْنَ حَمْدَ النَّاعِمِيْنَ حَمْدًا يُوَافِي نِعَمَهُ وَيُكَافِئُ مَزِيْدَهُ. يَا رَبَّنَا لَكَ الْحَمْدُ كَمَا يَنْبَغِي لِجَلَالِ وَجْهِكَ وَلِعَظِيْمِ سُلْطَانِكَ. أَللّٰهُمَّ صَلِّ وَسَلِّمْ عَلَى سَيِّدِنَا مُحَمَّدٍ فِي الْأَوَّلِيْنَ وَالْآخِرِيْنَ وَفِي الْمَلَإِ الْأَعْلَى إِلَى يَوْمِ الدِّيْنِ", 
    latin: "Alhamdulillahi rabbil 'alamin... Allahumma salli wa sallim 'ala sayyidina muhammadin fil awwalina wal akhirin...", 
    indo: "Mukadimah Hamdalah & Shalawat Agung." 
  },
  { 
    id: 2, 
    arab: "أَللّٰهُمَّ تَقَبَّلْ وَأَوْصِلْ ثَوَابَ مَا قَرَأْنَاهُ مِنْ كِتَابِكَ الْعَظِيْمِ (سُوْرَةِ يس) وَمَا هَلَّلْنَاهُ وَمَا سَبَّحْنَاهُ وَمَا اسْتَغْفَرْنَاهُ وَمَا صَلَّيْنَاهُ عَلَى سَيِّدِنَا مُحَمَّدٍ هَدِيَّةً مَقْبُوْلَةً وَرَحْمَةً نَازِلَةً وَبَرَكَةً شَامِلَةً إِلَى حَضَرَةِ النَّبِيِّ الْمُصْطَفَى مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، وَإِلَى أَرْوَاحِ أَوْلِيَاءِ اللّٰهِ كَافَّةً، وَخُصُوْصًا إِلَى حَضْرَةِ سُلْطَانِ أَوْلِيَاءِ كَارُبَانِ سَيِّدِنَا شَرِيْفِ هِدَايَتِ اللّٰهِ (سُنَنْ ݢُونُونْ ݢَاتِي) وَإِلَى أَرْوَاحِ سَائِرِ أَوْلِيَاءِ سَبْعَةِ وَأَوْلِيَاءِ تِسْعَةِ فِي طَبَقَاتِ هٰذِهِ الْأَرْضِ", 
    latin: "Allahumma taqabbal wa awsil thawaba ma qara'nahu... khususan ila hadhrati Sultani Auliya'i Karuban Sayyidina Syarif Hidayatullah (Sunan Gunung Jati)...", 
    indo: "Permohonan Sampainya Pahala Yasin & Tahlil Khususon Kanjeng Sunan Gunung Jati & Wali Sanga." 
  },
  { 
    id: 3, 
    arab: "ثُمَّ إِلَى أَرْوَاحِ جَمِيْعِ أَهْلِ الْقُبُوْرِ مِنَ الْمُسْلِمِيْنَ وَالْمُسْلِمَاتِ مِنْ مَشَارِقِ الْأَرْضِ إِلَى مَغَارِبِهَا، وَخُصُوْصًا إِلَى أَرْوَاحِ صَاحِبِ هٰذِهِ الْمَقْبَرَةِ الْمُبَارَكَةِ (بُويُوت كِبُوه وَبُويُوت بِسُوس) وَإِلَى أَرْوَاحِ آبَائِنَا وَأُمَّهَاتِنَا وَأَجْدَادِنَا وَجَدَّاتِنَا وَمَشَايِخِنَا وَأَهْلِ بَلَدَتِنَا هٰذِهِ", 
    latin: "Thumma ila arwahi jami'i ahlil quburi... wa khususan ila arwahi Buyut Kepuh & Buyut Besus...", 
    indo: "Pengkhususan Doa untuk Ahli Kubur Maqbaroh Buyut Kepuh & Buyut Besus serta Seluruh Leluhur Desa." 
  },
  { 
    id: 4, 
    arab: "أَللّٰهُمَّ اغْفِرْ لَهُمْ وَارْحَمْهُمْ وَعَافِهِمْ وَاعْفُ عَنْهُمْ. أَللّٰهُمَّ أَنْزِلِ الرَّحْمَةَ وَالْمَغْفِرَةَ وَالرِّضْوَانَ عَلَى أَهْلِ الْقُبُوْرِ مِنْ أَهْلِ لَا إِلٰهَ إِلَّا اللّٰهُ مُحَمَّدٌ رَسُوْلُ اللّٰهِ. أَللّٰهُمَّ اجْعَلْ قُبُوْرَهُمْ رَوْضَةً مِنْ رِيَاضِ الْجِنَانِ وَلَا تَجْعَلْ قُبُوْرَهُمْ حُفْرَةً مِنْ حُفَرِ النِّيْرَانِ", 
    latin: "Allahummaghfir lahum warhamhum... Allahummaj'al quburahum raudhatan min riyadhil jinan...", 
    indo: "Doa Ampunan & Permohonan Taman Surga bagi Ahli Kubur." 
  },
  { 
    id: 5, 
    arab: "أَللّٰهُمَّ ادْفَعْ عَنَّا الْبَلَاءَ وَالْوَبَاءَ وَالزَّلَازِلَ وَالْمِحَنَ وَسُوْءَ الْفِتْنَةِ مَا ظَهَرَ مِنْهَا وَمَا بَطَنَ عَنْ بَلَدِنَا جِرِبُونَ خَاصَّةً وَعَنْ سَائِرِ بُلْدَانِ الْمُسْلِمِيْنَ عَامَّةً يَا رَبَّ الْعَالَمِيْنَ. أَللّٰهُمَّ اجْعَلْ بَلْدَتَنَا هٰذِهِ بَلْدَةً طَيِّبَةً آمِنَةً مُطْمَئِنَّةً وَسَائِرَ بِلَادِ الْمُسْلِمِيْنَ", 
    latin: "Allahummadfa' 'annal bala'a... wa 'an baladina Cirebon khassatan...", 
    indo: "Doa Penolak Bencana & Keselamatan untuk Wilayah Cirebon & Seluruh Jemaah." 
  },
  { 
    id: 6, 
    arab: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ. سُبْحَانَ رَبِّكَ رَبِّ الْعِزَّةِ عَمَّا يَصِفُونَ وَسَلَامٌ عَلَى الْمُرْسَلِينَ وَالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ. سُوْرَةُ الْفَاتِحَة...", 
    latin: "Rabbana atina fid-dunya hasanah... Walhamdulillahi rabbil 'alamin. Al-Fatihah...", 
    indo: "Penutup Doa Sapu Jagat & Fatihah Penutup." 
  }
];

export default function YasinPage() {
  const [activeTab, setActiveTab] = useState('yasin');
  const [fontSize, setFontSize] = useState(32);
  const [yasinAyat, setYasinAyat] = useState([]);
  const [loadingYasin, setLoadingYasin] = useState(true);

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
      {/* Font Amiri khas Mushaf Al-Qur'an */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap');
        .font-quran {
          font-family: 'Amiri', 'Traditional Arabic', 'Scheherazade New', serif;
        }
      `}</style>

      {/* Navigation Header */}
      <div className="flex items-center justify-between theme-bg-secondary theme-border p-4 rounded-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold theme-text-accent hover:opacity-80">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Utama
        </Link>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setFontSize(prev => Math.max(22, prev - 2))}
            className="p-2 theme-bg-tertiary rounded-xl theme-text-primary text-xs font-bold border theme-border flex items-center gap-1"
            title="Kecilkan Teks"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setFontSize(prev => Math.min(54, prev + 2))}
            className="p-2 theme-bg-tertiary rounded-xl theme-text-primary text-xs font-bold border theme-border flex items-center gap-1"
            title="Besarkan Teks"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 theme-bg-secondary rounded-2xl theme-border">
        <button
          onClick={() => setActiveTab('yasin')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'yasin' 
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black' 
              : 'theme-text-secondary hover:theme-text-primary'
          }`}
        >
          Surat Yasin (83)
        </button>
        <button
          onClick={() => setActiveTab('tahlil')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tahlil' 
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black' 
              : 'theme-text-secondary hover:theme-text-primary'
          }`}
        >
          Tahlil
        </button>
        <button
          onClick={() => setActiveTab('doa')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'doa' 
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black' 
              : 'theme-text-secondary hover:theme-text-primary'
          }`}
        >
          Doa
        </button>
      </div>

      {/* Title */}
      <div className="text-center space-y-1 py-2">
        <h2 className="text-base font-black uppercase tracking-wider theme-text-primary flex items-center justify-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          {activeTab === 'yasin' && 'Surah YaSiin (Lengkap 83 Ayat)'}
          {activeTab === 'tahlil' && 'Tahlil Kubro Versi Majmu\' Syarif / Sunan Gunung Jati'}
          {activeTab === 'doa' && 'Doa Tahlil & Haul Keraton / Masyayikh Cirebon'}
        </h2>
        <p className="text-xs theme-text-secondary font-medium">
          Susunan Resmi: Tawassul → Ayat Pilihan → Istighfar → Shalawat → Tasbih → Tahlil → Doa
        </p>
      </div>

      {/* TAB 1: YASIN */}
      {activeTab === 'yasin' && (
        <div className="space-y-4">
          {loadingYasin ? (
            <div className="text-center py-12 space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs theme-text-secondary font-mono animate-pulse">Memuat 83 Ayat Surah YaSiin...</p>
            </div>
          ) : (
            yasinAyat.map((item) => (
              <div key={item.nomorAyat} className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-md">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-mono text-xs font-black flex items-center justify-center shadow-sm">
                    {item.nomorAyat}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-800 uppercase tracking-wide">Surah YaSiin : Ayat {item.nomorAyat}</span>
                </div>

                <p 
                  className="text-right font-quran text-slate-900 py-3 font-bold whitespace-pre-line"
                  style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize * 2.2}px` }}
                  dir="rtl"
                >
                  {item.teksArab}
                </p>

                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  <p className="text-xs font-bold text-emerald-700 italic font-mono">
                    {item.teksLatin}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    "{item.teksIndonesia}"
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: TAHLIL GUNUNG JATI (MAJMU' SYARIF) */}
      {activeTab === 'tahlil' && (
        <div className="space-y-4">
          {TAHLIL_GUNUNGJATI.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-md">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-mono text-xs font-black flex items-center justify-center shadow-sm">
                  {item.id}
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-800 uppercase tracking-wide">Urutan Tahlil #{item.id}</span>
              </div>

              <p 
                className="text-right font-quran text-slate-900 py-3 font-bold whitespace-pre-line"
                style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize * 2.2}px` }}
                dir="rtl"
              >
                {item.arab}
              </p>

              <div className="space-y-1.5 pt-3 border-t border-slate-100">
                <p className="text-xs font-bold text-emerald-700 italic font-mono">
                  {item.latin}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  "{item.indo}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: DOA TAHLIL */}
      {activeTab === 'doa' && (
        <div className="space-y-4">
          {DOA_GUNUNGJATI.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-md">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="w-8 h-8 rounded-full bg-amber-600 text-white font-mono text-xs font-black flex items-center justify-center shadow-sm">
                  {item.id}
                </span>
                <span className="text-[11px] font-mono font-bold text-amber-800 uppercase tracking-wide">Doa Haul Cirebon #{item.id}</span>
              </div>

              <p 
                className="text-right font-quran text-slate-900 py-3 font-bold whitespace-pre-line"
                style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize * 2.2}px` }}
                dir="rtl"
              >
                {item.arab}
              </p>

              <div className="space-y-1.5 pt-3 border-t border-slate-100">
                <p className="text-xs font-bold text-emerald-700 italic font-mono">
                  {item.latin}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
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
