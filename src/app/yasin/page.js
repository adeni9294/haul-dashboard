'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ZoomIn, ZoomOut, Loader2, BookOpen } from 'lucide-react';

// BACAAN TAHLIL KUBRO / PESANTREN LENGKAP UTUH
const TAHLIL_PESANTREN = [
  { 
    id: 1, 
    arab: "إِلَى حَضْرَةِ النَّبِيِّ الْمُصْطَفَى مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ وَآلِهِ وَأَزْوَاجِهِ وَذُرِّيَّاتِهِ وَأَهْلِ بَيْتِهِ الْكِرَامِ، شَيْءٌ لِلّٰهِ لَهُمُ الْفَاتِحَةُ...", 
    latin: "Ila hadhratin-nabiyyil musthafa muhammadin sallallahu 'alaihi wasallama wa alihi wa azwajihi wa dhurriyyatihi wa ahli baitihil kiram, syai'ul lillahi lahumul fatihah...", 
    indo: "Tawasul 1: Kepada Nabi Agung Muhammad SAW, keluarga, istri-istri, putra-putri, dan ahli baitnya. (Membaca Al-Fatihah)" 
  },
  { 
    id: 2, 
    arab: "ثُمَّ إِلَى حَضَرَاتِ إِخْوَانِهِ مِنَ الأَنْبِيَاءِ وَالْمُرْسَلِيْنَ وَالأَوْلِيَاءِ وَالشُّهَدَاءِ وَالصَّالِحِيْنَ وَالصَّحَابَةِ وَالتَّابِعِيْنَ وَالْعُلَمَاءِ الْعَامِلِيْنَ وَالْمُصَنِّفِيْنَ الْمُخْلِصِيْنَ وَجَمِيْعِ الْمَلَائِكَةِ الْمُقَرَّبِيْنَ، خُصُوْصًا سَيِّدَنَا الشَّيْخَ عَبْدَ القَادِرِ الجَيْلَانِيّ، شَيْءٌ لِلّٰهِ لَهُمُ الْفَاتِحَةُ...", 
    latin: "Thumma ila hadharati ikhwanihi minal anbiya'i wal mursalin wal auliya'i wash-shuhada'i wash-shalihin... khususan Sayyidanasy-Syaikh 'Abdul Qadir Al-Jilani...", 
    indo: "Tawasul 2: Kepada para Nabi, Rasul, Wali, Syuhada, Shalihein, Ulama, dan Syekh Abdul Qadir Al-Jilani. (Membaca Al-Fatihah)" 
  },
  { 
    id: 3, 
    arab: "ثُمَّ إِلَى أَرْوَاحِ جَمِيْعِ أَهْلِ القُبُوْرِ مِنَ المُسْلِمِيْنَ وَالمُسْلِمَاتِ وَالمُؤْمِنِيْنَ وَالمُؤْمِنَاتِ مِنْ مَشَارِقِ الأَرْضِ إِلَى مَغَارِبِهَا بَرِّهَا وَبَحْرِهَا، خُصُوْصًا إِلَى آبَائِنَا وَأُمَّهَاتِنَا وَأَجْدَادِنَا وَجَدَّاتِنَا وَمَشَايِخِنَا وَمَشَايِخِ مَشَايِخِنَا، وَخُصُوْصًا إِلَى صَاحِبِ هٰذِهِ المَقْبَرَةِ (بُويُوت كِبُوه وَبُويُوت بِسُوس) وَكَافَّةِ جَمِيْعِ أَهْلِ القُبُوْرِ مِنْ اَهْلِ هٰذِهِ القَرْيَةِ، شَيْءٌ لِلّٰهِ لَهُمُ الْفَاتِحَةُ...", 
    latin: "Thumma ila arwahi jami'i ahlil quburi minal muslimina wal muslimat... wa khususan ila sahibi hadhihil maqbarah (Buyut Kepuh & Buyut Besus)... lahumul fatihah...", 
    indo: "Tawasul 3: Khususon para leluhur, Masyayikh, Ahli Kubur Maqbaroh Buyut Kepuh & Buyut Besus, serta seluruh arwah warga desa. (Membaca Al-Fatihah)" 
  },
  { 
    id: 4, 
    arab: "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ. قُلْ هُوَ اللّٰهُ أَحَدٌ. اللّٰهُ الصَّمَدُ. لَمْ يَلِدْ وَلَمْ يُولَدْ. وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ (٣x)", 
    latin: "Surah Al-Ikhlas (3x)", 
    indo: "Membaca Surah Al-Ikhlas (3 kali)." 
  },
  { 
    id: 5, 
    arab: "لَا إِلٰهَ إِلَّا اللّٰهُ وَاللّٰهُ أَكْبَرُ، وَلِلّٰهِ الْحَمْدُ", 
    latin: "La ilaha illallahu wallahu akbar, walillahil hamd", 
    indo: "Tahlil dan Takbir." 
  },
  { 
    id: 6, 
    arab: "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ. قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ. مِنْ شَرِّ مَا خَلَقَ. وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ. وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ. وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ", 
    latin: "Surah Al-Falaq", 
    indo: "Membaca Surah Al-Falaq." 
  },
  { 
    id: 7, 
    arab: "لَا إِلٰهَ إِلَّا اللّٰهُ وَاللّٰهُ أَكْبَرُ، وَلِلّٰهِ الْحَمْدُ", 
    latin: "La ilaha illallahu wallahu akbar, walillahil hamd", 
    indo: "Tahlil dan Takbir." 
  },
  { 
    id: 8, 
    arab: "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ. قُلْ أَعُوذُ بِرَبِّ النَّاسِ. مَلِكِ النَّاسِ. إِلٰهِ النَّاسِ. مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ. الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ. مِنَ الْجِنَّةِ وَالنَّاسِ", 
    latin: "Surah An-Nas", 
    indo: "Membaca Surah An-Nas." 
  },
  { 
    id: 9, 
    arab: "لَا إِلٰهَ إِلَّا اللّٰهُ وَاللّٰهُ أَكْبَرُ، وَلِلّٰهِ الْحَمْدُ", 
    latin: "La ilaha illallahu wallahu akbar, walillahil hamd", 
    indo: "Tahlil dan Takbir." 
  },
  { 
    id: 10, 
    arab: "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ. الْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِيْنَ...", 
    latin: "Surah Al-Fatihah", 
    indo: "Membaca Surah Al-Fatihah." 
  },
  { 
    id: 11, 
    arab: "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ. الم. ذٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيْهِ ۛ هُدًى لِلْمُتَّقِيْنَ. الَّذِيْنَ يُؤْمِنُوْنَ بِالْغَيْبِ وَيُقِيْمُوْنَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنْفِقُوْنَ. وَالَّذِيْنَ يُؤْمِنُوْنَ بِمَا أُنْزِلَ إِلَيْكَ وَمَا أُنْزِلَ مِنْ قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوْقِنُوْنَ. أُولٰئِكَ عَلَىٰ هُدًى مِنْ رَبِّهِمْ ۖ وَأُولٰئِكَ هُمُ الْمُفْلِحُوْنَ", 
    latin: "Surah Al-Baqarah: 1-5", 
    indo: "Membaca Surah Al-Baqarah ayat 1-5." 
  },
  { 
    id: 12, 
    arab: "وَإِلٰهُكُمْ إِلٰهٌ وَاحِدٌ ۖ لَا إِلٰهَ إِلَّا هُوَ الرَّحْمٰنُ الرَّحِيْمُ", 
    latin: "Wa ilahukum ilahun wahid, la ilaha illa huwar-rahmanur-rahim", 
    indo: "Ayat Tauhid (Al-Baqarah: 163)." 
  },
  { 
    id: 13, 
    arab: "اللّٰهُ لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ", 
    latin: "Ayat Kursi (Al-Baqarah: 255)", 
    indo: "Membaca Ayat Kursi." 
  },
  { 
    id: 14, 
    arab: "لِلّٰهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ وَإِنْ تُبْدُوا مَا فِي أَنْفُسِكُمْ أَوْ تُخْفُوهُ يُحَاسِبْكُمْ بِهِ اللّٰهُ ۖ فَيَغْفِرُ لِمَنْ يَشَاءُ وَيُعَذِّبُ مَنْ يَشَاءُ ۗ وَاللّٰهُ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ. آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللّٰهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِنْ رُسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ. لَا يُكَلِّفُ اللّٰهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا (٧x) أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ", 
    latin: "Lillahi ma fis-samawati wa ma fil-ard... Wa'fu 'anna waghfir lana warhamna (7x)", 
    indo: "Membaca 3 Ayat Terakhir Al-Baqarah + Permohonan Ampunan (Diulang 7x)." 
  },
  { 
    id: 15, 
    arab: "إِرْحَمْنَا يَا أَرْحَمَ الرَّاحِمِيْنَ (٧x)", 
    latin: "Irhamna ya arhamar-rahimin (7x)", 
    indo: "Istighotsah Rahmat (Diulang 7 kali)." 
  },
  { 
    id: 16, 
    arab: "رَحْمَتُ اللّٰهِ وَبَرَكَاتُهُ عَلَيْكُمْ أَهْلَ الْبَيْتِ ۚ إِنَّهُ حَمِيدٌ مَجِيدٌ. إِنَّمَا يُرِيدُ اللّٰهُ لِيُذْهِبَ عَنْكُمُ الرِّجْسَ أَهْلَ الْبَيْتِ وَيُطَهِّرَكُمْ تَطْهِيرًا. إِنَّ اللّٰهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ ۚ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا", 
    latin: "Rahmatullahi wa barakatuhu 'alaikum ahlal baiti...", 
    indo: "Ayat Shalawat & Pembersihan Ahli Bait." 
  },
  { 
    id: 17, 
    arab: "أَللّٰهُمَّ صَلِّ أَفْضَلَ الصَّلَاةِ عَلَى أَسْعَدِ مَخْلُوْقَاتِكَ سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ، عَدَدَ مَعْلُوْمَاتِكَ وَمِدَادَ كَلِمَاتِكَ كُلَّمَا ذَكَرَكَ الذَّاكِرُوْنَ وَغَفَلَ عَنْ ذِكْرِكَ الْغَافِلُوْنَ (٣x)", 
    latin: "Allahumma salli afdhalas-salati 'ala as'adi makhluqatika sayyidina muhammadin...", 
    indo: "Shalawat Kamaliyah (Dibaca 3 kali)." 
  },
  { 
    id: 18, 
    arab: "وَسَلِّمْ وَرَضِيَ اللّٰهُ تَبَارَكَ وَتَعَالَى عَنْ سَادَاتِنَا أَصْحَابِ رَسُوْلِ اللّٰهِ أَجْمَعِيْنَ. وَحَسْبُنَا اللّٰهُ وَنِعْمَ الْوَكِيْلُ، نِعْمَ الْمَوْلَى وَنِعْمَ النَّصِيْرُ. وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ الْعَلِيِّ الْعَظِيْمِ", 
    latin: "Wa sallim wa radhiyallahu tabaraka wa ta'ala 'an sadatina as-habi rasulillahi ajma'in...", 
    indo: "Keridhaan Sahabat & Pasrah Diri (Hawqalah)." 
  },
  { 
    id: 19, 
    arab: "أَسْتَغْفِرُ اللّٰهَ الْعَظِيْمَ (٣٣x)", 
    latin: "Astaghfirullahal 'Adzim (33x)", 
    indo: "Istighfar Agung (33 kali)." 
  },
  { 
    id: 20, 
    arab: "أَفْضَلُ الذِّكْرِ فَاعْلَمْ أَنَّهُ لَا إِلٰهَ إِلَّا اللهُ، حَيٌّ مَوْجُوْدٌ. لَا إِلٰهَ إِلَّا اللهُ، حَيٌّ مَعْبُوْدٌ. لَا إِلٰهَ إِلَّا اللهُ، حَيٌّ بَاقٍ الَّذِي لَا يَمُوْتُ", 
    latin: "Afdhaludz-dzikri fa'lam annahu la ilaha illallah, hayyun maujud...", 
    indo: "Pengantar Tahlil Utama Pesantren." 
  },
  { 
    id: 21, 
    arab: "لَا إِلٰهَ إِلَّا اللهُ (١٠٠x)", 
    latin: "Lā ilāha illallāh (100x / Secukupnya)", 
    indo: "Membaca Kalimat Tahlil (100 kali / Berjamaah)." 
  },
  { 
    id: 22, 
    arab: "لَا إِلٰهَ إِلَّا اللهُ مُحَمَّدٌ رَسُوْلُ اللهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، كَلِمَةُ حَقٍّ عَلَيْهَا نَحْيَا وَعَلَيْهَا نَمُوْتُ وَبِهَا نُبْعَثُ إِنْ شَاءَ اللّٰهُ تَعَالَى مِنَ الْآمِنِيْنَ. بِرَحْمَتِكَ يَا أَرْحَمَ الرَّاحِمِيْنَ", 
    latin: "La ilaha illallahu muhammadur rasulullahi sallallahu 'alaihi wa sallam...", 
    indo: "Kalimat Penutup Tahlil Pesantren." 
  }
];

// DOA HAUL AKMAL / PESANTREN LENGKAP UTUH
const DOA_PESANTREN = [
  { 
    id: 1, 
    arab: "أَعُوْذُ بِاللهِ مِنَ الشَّيْطَانِ الرَّجِيْمِ. بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ. الْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِيْنَ حَمْدَ الشَّاكِرِيْنَ حَمْدَ النَّاعِمِيْنَ حَمْدًا يُوَافِي نِعَمَهُ وَيُكَافِئُ مَزِيْدَهُ. يَا رَبَّنَا لَكَ الْحَمْدُ كَمَا يَنْبَغِي لِجَلَالِ وَجْهِكَ وَلِعَظِيْمِ سُلْطَانِكَ. أَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَاةً تُنْجِيْنَا بِهَا مِنْ جَمِيْعِ الْأَهْوَالِ وَالْآفَاتِ، وَتَقْضِي لَنَا بِهَا جَمِيْعَ الْحَاجَاتِ، وَتُطَهِّرُنَا بِهَا مِنْ جَمِيْعِ السَّيِّئَاتِ، وَتَرْفَعُنَا بِهَا عِنْدَكَ أَعْلَى الدَّرَجَاتِ، وَتُبَلِّغُنَا بِهَا أَقْصَى الْغَايَاتِ مِنْ جَمِيْعِ الْخَيْرَاتِ فِي الْحَيَاةِ وَبَعْدَ الْمَمَاتِ", 
    latin: "Alhamdulillahi rabbil 'alamin... Allahumma salli 'ala sayyidina muhammadin salatan tunjina biha min jami'il ahwali wal afat...", 
    indo: "Pembukaan Doa: Mukadimah Hamdalah & Shalawat Munjiyat Pesantren." 
  },
  { 
    id: 2, 
    arab: "أَللّٰهُمَّ تَقَبَّلْ وَأَوْصِلْ ثَوَابَ مَا قَرَأْنَاهُ مِنْ كِتَابِكَ الْعَظِيْمِ (سُوْرَةِ يس) وَمَا هَلَّلْنَاهُ وَمَا سَبَّحْنَاهُ وَمَا اسْتَغْفَرْنَاهُ وَمَا صَلَّيْنَاهُ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ هَدِيَّةً وَاصِلَةً وَرَحْمَةً نَازِلَةً وَبَرَكَةً شَامِلَةً إِلَى حَضَرَةِ حَبِيْبِنَا وَشَفِيْعِنَا وَقُرَّةِ أَعْيُنِنَا سَيِّدِنَا وَمَوْلَانَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، وَإِلَى أَرْوَاحِ جَمِيْعِ إِخْوَانِهِ مِنَ الْأَنْبِيَاءِ وَالْمُرْسَلِيْنَ وَالْأَوْلِيَاءِ وَالشُّهَدَاءِ وَالصَّالِحِيْنَ وَالصَّحَابَةِ وَالتَّابِعِيْنَ وَالْعُلَمَاءِ الْعَامِلِيْنَ وَالْمُصَنِّفِيْنَ الْمُخْلِصِيْنَ وَجَمِيْعِ الْمُجَاهِدِيْنَ فِي سَبِيْلِ اللّٰهِ رَبِّ الْعَالَمِيْنَ وَالْمَلَائِكَةِ الْمُقَرَّبِيْنَ", 
    latin: "Allahumma taqabbal wa awsil thawaba ma qara'nahu min kitabikal 'adzim (Surah Yasin)...", 
    indo: "Permohonan Hadiah Pahala Yasin & Tahlil kepada Nabi SAW & Seluruh Wali/Ulama." 
  },
  { 
    id: 3, 
    arab: "ثُمَّ إِلَى أَرْوَاحِ جَمِيْعِ أَهْلِ الْقُبُوْرِ مِنَ الْمُسْلِمِيْنَ وَالْمُسْلِمَاتِ وَالْمُؤْمِنِيْنَ وَالْمُؤْمِنَاتِ مِنْ مَشَارِقِ الْأَرْضِ إِلَى مَغَارِبِهَا بَرِّهَا وَبَحْرِهَا، وَخُصُوْصًا إِلَى أَرْوَاحِ صَاحِبِ هٰذِهِ الْمَقْبَرَةِ (بُويُوت كِبُوه وَبُويُوت بِسُوس) وَإِلَى أَرْوَاحِ آبَائِنَا وَأُمَّهَاتِنَا وَأَجْدَادِنَا وَجَدَّاتِنَا وَمَشَايِخِنَا وَمَشَايِخِ مَشَايِخِنَا وَأَسَاتِذَتِنَا وَأَسَاتِذَةِ أَسَاتِذَتِنَا وَلِمَنْ أَحْسَنَ إِلَيْنَا وَلِمَنْ حَضَرَ فِي هٰذَا الْجَمْعِ وَلِأُمَّهَاتِهِمْ وَآبَائِهِمْ وَأَقَارِبِهِمْ", 
    latin: "Thumma ila arwahi jami'i ahlil quburi minal muslimina wal muslimat... wa khususan ila arwahi Buyut Kepuh & Buyut Besus...", 
    indo: "Pengkhususan Doa untuk Ahli Kubur Maqbaroh Buyut Kepuh & Buyut Besus serta Seluruh Silsilah Masyayikh & Jemaah." 
  },
  { 
    id: 4, 
    arab: "أَللّٰهُمَّ اغْفِرْ لَهُمْ وَارْحَمْهُمْ وَعَافِهِمْ وَاعْفُ عَنْهُمْ. أَللّٰهُمَّ أَنْزِلِ الرَّحْمَةَ وَالْمَغْفِرَةَ وَالرِّضْوَانَ عَلَى أَهْلِ الْقُبُوْرِ مِنْ أَهْلِ لَا إِلٰهَ إِلَّا اللّٰهُ مُحَمَّدٌ رَسُوْلُ اللّٰهِ. أَللّٰهُمَّ اجْعَلْ قُبُوْرَهُمْ رَوْضَةً مِنْ رِيَاضِ الْجِنَانِ وَلَا تَجْعَلْ قُبُوْرَهُمْ حُفْرَةً مِنْ حُفَرِ النِّيْرَانِ. أَللّٰهُمَّ يَمِّنْ كِتَابَهُمْ وَيَسِّرْ حِسَابَهُمْ وَثَقِّلْ بِمِيْزَانِ الْحَسَنَاتِ مَوَازِيْنَهُمْ وَثَبِّتْ عَلَى الصِّرَاطِ أَقْدَامَهُمْ وَأَسْكِنْهُمْ فِي وَسَطِ الْجَنَّةِ مَعَ النَّبِيِّيْنَ وَالصِّدِّيْقِيْنَ وَالشُّهَدَاءِ وَالصَّالِحِيْنَ", 
    latin: "Allahummaghfir lahum warhamhum wa 'afihim wa'fu 'anhum... Allahummaj'al quburahum raudhatan min riyadhil jinan...", 
    indo: "Permohonan Rahmah, Keleluasaan Kubur, Syafaat, dan Pengampunan Dosa Ahli Kubur." 
  },
  { 
    id: 5, 
    arab: "أَللّٰهُمَّ ادْفَعْ عَنَّا الْبَلَاءَ وَالْوَبَاءَ وَالزَّلَازِلَ وَالْمِحَنَ وَسُوْءَ الْفِتْنَةِ مَا ظَهَرَ مِنْهَا وَمَا بَطَنَ عَنْ بَلَدِنَا هٰذَا خَاصَّةً وَعَنْ سَائِرِ بُلْدَانِ الْمُسْلِمِيْنَ عَامَّةً يَا رَبَّ الْعَالَمِيْنَ. أَللّٰهُمَّ أَصْلِحْ لَنَا دِيْنَنَا الَّذِي هُوَ عِصْمَةُ أَمْرِنَا، وَأَصْلِحْ لَنَا دُنْيَانَا الَّتِي فِيْهَا مَعَاشُنَا، وَأَصْلِحْ لَنَا آخِرَتَنَا الَّتِي فِيْهَا مَعَادُنَا، وَاجْعَلِ الْحَيَاةَ زِيَادَةً لَنَا فِي كُلِّ خَيْرٍ، وَاجْعَلِ الْمَوْتَ رَاحَةً لَنَا مِنْ كُلِّ شَرٍّ", 
    latin: "Allahummadfa' 'annal bala'a wal waba'a wal zalazila... Allahumma aslih lana dinanal-ladhi huwa 'ismatu amrina...", 
    indo: "Doa Keselamatan Desa/Masyarakat dari Bencana, Fitnah, serta Perbaikan Kehidupan Dunia-Akhirat." 
  },
  { 
    id: 6, 
    arab: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ. سُبْحَانَ رَبِّكَ رَبِّ الْعِزَّةِ عَمَّا يَصِفُونَ وَسَلَامٌ عَلَى الْمُرْسَلِينَ وَالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ. سُوْرَةُ الْفَاتِحَة...", 
    latin: "Rabbana atina fid-dunya hasanah wa fil-akhirati hasanah wa qina 'adhaban-nar. Walhamdulillahi rabbil 'alamin. Al-Fatihah...", 
    indo: "Penutup Doa: Doa Sapu Jagat, Tasbih Keagungan Allah, Hamdalah, dan Fatihah Penutup." 
  }
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
          Tahlil Pesantren
        </button>
        <button
          onClick={() => setActiveTab('doa')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'doa' 
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black' 
              : 'theme-text-secondary hover:theme-text-primary'
          }`}
        >
          Doa Haul Akmal
        </button>
      </div>

      {/* Title Header */}
      <div className="text-center space-y-1 py-2">
        <h2 className="text-base font-black uppercase tracking-wider theme-text-primary flex items-center justify-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          {activeTab === 'yasin' && 'Surah YaSiin (Lengkap 83 Ayat)'}
          {activeTab === 'tahlil' && 'Tahlil Kubro Versi Pesantren / Pondok'}
          {activeTab === 'doa' && 'Doa Khusus Haul Akmal & Istighotsah'}
        </h2>
        <p className="text-xs theme-text-secondary font-medium">
          Standar Majlis An-Nahdliyyah & Masyayikh Pesantren (Lengkap Teks Arab Utuh, Latin, & Terjemahan)
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

      {/* TAB 2: TAHLIL LENGKAP UTUH PESANTREN */}
      {activeTab === 'tahlil' && (
        <div className="space-y-4">
          {TAHLIL_PESANTREN.map((item) => (
            <div key={item.id} className="theme-bg-secondary border theme-border p-5 rounded-3xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b theme-border pb-2">
                <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-black flex items-center justify-center">
                  {item.id}
                </span>
                <span className="text-[10px] font-mono theme-text-tertiary">Urutan Tahlil Pesantren #{item.id}</span>
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

      {/* TAB 3: DOA HAUL AKMAL PESANTREN */}
      {activeTab === 'doa' && (
        <div className="space-y-4">
          {DOA_PESANTREN.map((item) => (
            <div key={item.id} className="theme-bg-secondary border theme-border p-5 rounded-3xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b theme-border pb-2">
                <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-xs font-black flex items-center justify-center">
                  {item.id}
                </span>
                <span className="text-[10px] font-mono theme-text-tertiary">Doa Haul Akmal #{item.id}</span>
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
