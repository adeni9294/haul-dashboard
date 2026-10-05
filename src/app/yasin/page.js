'use client';

import { useState } from 'react';
import Link from 'next/link';
import GlassCard from '../components/GlassCard';
import { ArrowLeft, ZoomIn, ZoomOut, BookOpen } from 'lucide-react';

// DATA LOKAL 83 AYAT SURAH YASIN (STABIL & TANPA DEPENDENCY API EXTERNAL)
const YASIN_LOKAL = [
  { nomorAyat: 1, teksArab: "يسٓ", teksLatin: "Ya-Sin.", teksIndonesia: "Ya Sin." },
  { nomorAyat: 2, teksArab: "وَالْقُرْآنِ الْحَكِيمِ", teksLatin: "Wal-qur'anil-hakim.", teksIndonesia: "Demi Al-Qur'an yang penuh hikmah," },
  { nomorAyat: 3, teksArab: "إِنَّكَ لَمِنَ الْمُرْسَلِينَ", teksLatin: "Innaka laminal-mursalin.", teksIndonesia: "Sungguh, engkau (Muhammad) adalah salah seorang dari rasul-rasul," },
  { nomorAyat: 4, teksArab: "عَلَىٰ صِرَاطٍ مُسْتَقِيمٍ", teksLatin: "'Ala siratim mustaqim.", teksIndonesia: "(yang berada) di atas jalan yang lurus," },
  { nomorAyat: 5, teksArab: "تَنْزِيلَ الْعَزِيزِ الرَّحِيمِ", teksLatin: "Tanzilal-'azizir-rahim.", teksIndonesia: "(sebagai wahyu) yang diturunkan oleh Yang Mahaperkasa, Maha Penyayang," },
  { nomorAyat: 6, teksArab: "لِتُنْذِرَ قَوْمًا مَا أُنْذِرَ آبَاؤُهُمْ فَهُمْ غَافِلُونَ", teksLatin: "Litundzira qaumam ma undzira aba'uhum fahum ghafilun.", teksIndonesia: "agar engkau memberi peringatan kepada suatu kaum yang nenek moyangnya belum pernah diberi peringatan, karena itu mereka lalai." },
  { nomorAyat: 7, teksArab: "لَقَدْ حَقَّ الْقَوْلُ عَلَىٰ أَكْثَرِهِمْ فَهُمْ لَا يُؤْمِنُونَ", teksLatin: "Laqad haqqal-qaulu 'ala aktsarihim fahum la yu'minun.", teksIndonesia: "Sungguh, keputusan (azab) telah berlaku terhadap kebanyakan mereka, karena mereka tidak beriman." },
  { nomorAyat: 8, teksArab: "إِنَّا جَعَلْنَا فِي أَعْنَاقِهِمْ أَغْلَالًا فَهِيَ إِلَى الْأَذْقَانِ فَهُمْ مُقْمَحُونَ", teksLatin: "Inna ja'alna fi a'naqihim aghlalan fahiya ilal-adzaqani fahum muqmahun.", teksIndonesia: "Sungguh, Kami telah memasang belenggu di leher mereka, lalu tangan mereka (diangkat) ke dagu, karena itu mereka tertengadah." },
  { nomorAyat: 9, teksArab: "وَجَعَلْنَا مِنْ بَيْنِ أَيْدِيهِمْ سَدًّا وَمِنْ خَلْفِهِمْ سَدًّا فَأَغْشَيْنَاهُمْ فَهُمْ لَا يُبْصِرُونَ", teksLatin: "Wa ja'alna mim baini aidihim saddaw wa min khalfihim saddan fa aghsyainahum fahum la yubsirun.", teksIndonesia: "Dan Kami jadikan di hadapan mereka penyekat dan di belakang mereka penyekat (pula), dan Kami tutup (mata) mereka sehingga mereka tidak dapat melihat." },
  { nomorAyat: 10, teksArab: "وَسَوَاءٌ عَلَيْهِمْ أَأَنْذَرْتَهُمْ أَمْ لَمْ تُنْذِرْهُمْ لَا يُؤْمِنُونَ", teksLatin: "Wa sawa'un 'alaihim a-andzartahum am lam tundzirhum la yu'minun.", teksIndonesia: "Dan sama saja bagi mereka, apakah engkau memberi peringatan kepada mereka atau engkau tidak memberi peringatan kepada mereka, mereka tidak akan beriman." },
  { nomorAyat: 11, teksArab: "إِنَّمَا تُنْذِرُ مَنِ اتَّبَعَ الذِّكْرَ وَخَشِيَ الرَّحْمَٰنَ بِالْغَيْبِ ۖ فَبَشِّرْهُ بِمَغْفِرَةٍ وَأَجْرٍ كَرِيمٍ", teksLatin: "Innama tundziru manittaba'adz-dzikra wa khasyiyar-rahmana bil-ghaib, fa basysyirhu bimaghfiratiw wa ajrin karim.", teksIndonesia: "Sesungguhnya engkau hanya memberi peringatan kepada orang-orang yang mau mengikuti peringatan dan yang takut kepada Tuhan Yang Maha Pengasih tanpa melihat-Nya. Maka berilah mereka kabar gembira dengan ampunan dan pahala yang mulia." },
  { nomorAyat: 12, teksArab: "إِنَّا نَحْنُ نُحْيِي الْمَوْتَىٰ وَنَكْتُبُ مَا قَدَّمُوا وَآثَارَهُمْ ۚ وَكُلَّ شَيْءٍ أَحْصَيْنَاهُ فِي إِمَامٍ مُبِينٍ", teksLatin: "Inna nahnu nuhyil-mauta wa naktubu ma qaddamu wa atsarahum, wa kulla syai'in ahsainahu fi imamim mubin.", teksIndonesia: "Sungguh, Kamilah yang menghidupkan orang-orang yang mati, dan Kamilah yang mencatat apa yang telah mereka kerjakan dan bekas-bekas yang mereka tinggalkan. Dan segala sesuatu Kami kumpulkan dalam Kitab Induk yang jelas (Lauh Mahfuzh)." },
  { nomorAyat: 13, teksArab: "وَاضْرِبْ لَهُمْ مَثَلًا أَصْحَابَ الْقَرْيَةِ إِذْ جَاءَهَا الْمُرْسَلُونَ", teksLatin: "Wadrib lahum matsalan as-habal-qaryah, idz ja'ahal-mursalun.", teksIndonesia: "Dan buatlah suatu perumpamaan bagi mereka, yaitu penduduk suatu negeri ketika utusan-utusan datang kepada mereka." },
  { nomorAyat: 14, teksArab: "إِذْ أَرْسَلْنَا إِلَيْهِمُ اثْنَيْنِ فَكَذَّبُوهُمَا فَعَزَّزْنَا بِثَالِثٍ فَقَالُوا إِنَّا إِلَيْكُمْ مُرْسَلُونَ", teksLatin: "Idz arsalna ilaihimuts-naini fakadz-dzabuhuma fa 'azzazna bitsalitsin faqalu inna ilaikum mursalun.", teksIndonesia: "(yaitu) ketika Kami mengutus kepada mereka dua orang utusan, lalu mereka mendustakan keduanya; kemudian Kami kuatkan dengan (utusan) yang ketiga, maka ketiga utusan itu berkata, 'Sungguh, kami adalah orang-orang yang diutus kepadamu.'" },
  { nomorAyat: 15, teksArab: "قَالُوا مَا أَنْتُمْ إِلَّا بَشَرٌ مِثْلُنَا وَمَا أَنْزَلَ الرَّحْمَٰنُ مِنْ شَيْءٍ إِنْ أَنْتُمْ إِلَّا تَكْذِبُونَ", teksLatin: "Qalu ma antum illa basyarum mitsluna wa ma anzalar-rahmanu min syai'in in antum illa takdzibun.", teksIndonesia: "Merek (penduduk negeri) menjawab, 'Kamu ini tidak lain hanyalah manusia seperti kami, dan Tuhan Yang Maha Pengasih tidak menurunkan sesuatu apa pun; kamu hanyalah pendusta belaka.'" },
  { nomorAyat: 16, teksArab: "قَالُوا رَبُّنَا يَعْلَمُ إِنَّا إِلَيْكُمْ لَمُرْسَلُونَ", teksLatin: "Qalu rabbuna ya'lamu inna ilaikum lamursalun.", teksIndonesia: "Mereka (utusan-utusan) berkata, 'Tuhan kami mengetahui bahwa sesungguhnya kami benar-benar diutus kepadamu.'" },
  { nomorAyat: 17, teksArab: "وَمَا عَلَيْنَا إِلَّا الْبَلَاغُ الْمُبِينُ", teksLatin: "Wa ma 'alaina illal-balaghul-mubin.", teksIndonesia: "Dan kewajiban kami tidak lain hanyalah menyampaikan (perintah Allah) dengan jelas.'" },
  { nomorAyat: 18, teksArab: "قَالُوا إِنَّا تَطَيَّرْنَا بِكُمْ ۖ لَئِنْ لَمْ تَنْتَهُوا لَنَرْجُمَنَّكُمْ وَلَيَمَسَّنَّكُمْ مِنَّا عَذَابٌ أَلِيمٌ", teksLatin: "Qalu inna tatayyarna bikum, la'il lam tantahu lanarjumpannakum wa layamassan-nakum minna 'adzabun alim.", teksIndonesia: "Mereka menjawab, 'Sesungguhnya kami bernasib malang karena kamu. Sungguh, jika kamu tidak berhenti (menyeru kami), niscaya kami rajam kamu dan kamu pasti akan merasakan azab yang pedih dari kami.'" },
  { nomorAyat: 19, teksArab: "قَالُوا طَائِرُكُمْ مَعَكُمْ ۚ أَئِنْ ذُكِّرْتُمْ ۚ بَلْ أَنْتُمْ قَوْمٌ مُسْرِفُونَ", teksLatin: "Qalu ta'irukum ma'akum, a'in dzukkirtum, bal antum qaumum musrifun.", teksIndonesia: "Utusan-utusan itu berkata, 'Kemalangan kamu itu adalah karena kamu sendiri. Apakah karena kamu diberi peringatan (kamu mengancam kami)? Sebenarnya kamu adalah kaum yang melampaui batas.'" },
  { nomorAyat: 20, teksArab: "وَجَاءَ مِنْ أَقْصَى الْمَدِينَةِ رَجُلٌ يَسْعَىٰ قَالَ يَا قَوْمِ اتَّبِعُوا الْمُرْسَلِينَ", teksLatin: "Wa ja'a min aqsal-madinati rajuluy yas'a qala ya qaumittabi'ul-mursalin.", teksIndonesia: "Dan datanglah dari ujung kota, seorang laki-laki dengan bergegas dia berkata, 'Wahai kaumku! Ikutilah utusan-utusan itu.'" },
  { nomorAyat: 21, teksArab: "اتَّبِعُوا مَنْ لَا يَسْأَلُكُمْ أَجْرًا وَهُمْ مُهْتَدُونَ", teksLatin: "Ittabi'u mal la yas'alukum ajraw wa hum muhtadun.", teksIndonesia: "Ikutilah orang yang tidak meminta imbalan kepadamu; dan mereka adalah orang-orang yang mendapat petunjuk." },
  { nomorAyat: 22, teksArab: "وَمَا لِيَ لَا أَعْبُدُ الَّذِي فَطَرَنِي وَإِلَيْهِ تُرْجَعُونَ", teksLatin: "Wa ma liya la a'budul-ladzi fatarani wa ilaihi turja'un.", teksIndonesia: "Dan tidak ada alasan bagiku untuk tidak menyembah (Allah) yang telah mencitakanku dan hanya kepada-Nyalah kamu akan dikembalikan." },
  { nomorAyat: 23, teksArab: "أَأَتَّخِذُ مِنْ دُونِهِ آلِهَةً إِنْ يُرِدْنِ الرَّحْمَٰنُ بِضُرٍّ لَا تُغْنِ عَنِّي شَفَاعَتُهُمْ شَيْئًا وَلَا يُنْقِذُونِ", teksLatin: "A-'attakhidzu min dunihi alihatan iy yuridnir-rahmanu bidurril la tughni 'anni syafa'atuhum syai'aw wa la yunqidzun.", teksIndonesia: "Mengapa aku harus menyembah tuhan-tuhan selain-Nya? Jika (Allah) Yang Maha Pengasih menghendaki bencana terhadapku, niscaya pertolongan mereka tidak berguna sama sekali bagiku dan mereka tidak dapat menyelamatkanku." },
  { nomorAyat: 24, teksArab: "إِنِّي إِذًا لَفِي ضَلَالٍ مُبِينٍ", teksLatin: "Inni idzal lafi dalalim mubin.", teksIndonesia: "Sesungguhnya jika aku (berbuat) demikian, sungguh aku berada dalam kesesatan yang nyata." },
  { nomorAyat: 25, teksArab: "إِنِّي آمَنْتُ بِرَبِّكُمْ فَاسْمَعُونِ", teksLatin: "Inni amantu birabbikum fasma'un.", teksIndonesia: "Sesungguhnya aku telah beriman kepada Tuhanmu; maka dengarkanlah (pengakuan iman)-ku.'" },
  { nomorAyat: 26, teksArab: "قِيلَ ادْخُلِ الْجَنَّةَ ۖ قَالَ يَا لَيْتَ قَوْمِي يَعْلَمُونَ", teksLatin: "Qiladkhulil-jannah, qala ya laita qaumi ya'lamun.", teksIndonesia: "Dikatakan (kepadanya), 'Masuklah ke surga.' Dia berkata, 'Betapa menyenangkan sekiranya kaumku mengetahui,'" },
  { nomorAyat: 27, teksArab: "بِمَا غَفَرَ لِي رَبِّي وَجَعَلَنِي مِنَ الْمُكْرَمِينَ", teksLatin: "Bima ghafara li rabbi wa ja'alani minal-mukramin.", teksIndonesia: "apa yang menyebabkan Tuhanku memberi ampunan kepadaku dan menjadikan aku termasuk orang-orang yang dimuliakan." },
  { nomorAyat: 28, teksArab: "وَمَا أَنْزَلْنَا عَلَىٰ قَوْمِهِ مِنْ بَعْدِهِ مِنْ جُنْدٍ مِنَ السَّمَاءِ وَمَا كُنَّا مُنْزِلِينَ", teksLatin: "Wa ma anzalna 'ala qaumihi mim ba'dihi min jundim minas-sama'i wa ma kunna munzilin.", teksIndonesia: "Dan setelah dia (dibunuh), Kami tidak menurunkan suatu pasukan pun dari langit kepada kaumnya, dan Kami tidak perlu menurunannya." },
  { nomorAyat: 29, teksArab: "إِنْ كَانَتْ إِلَّا صَيْحَةً وَاحِدَةً فَإِذَا هُمْ خَامِدُونَ", teksLatin: "In kanat illa saihataw wahidatan fa idza hum khamidun.", teksIndonesia: "Tidak ada siksaan terhadap mereka melainkan satu teriakan saja; maka seketika itu mereka mati." },
  { nomorAyat: 30, teksArab: "يَا حَسْرَةً عَلَى الْعِبَادِ ۚ مَا يَأْتِيهِمْ مِنْ رَسُولٍ إِلَّا كَانُوا بِهِ يَسْتَهْزِئُونَ", teksLatin: "Ya hasratan 'alal-'ibad, ma ya'tihim mir rasulin illa kanu bihi yastahzi'un.", teksIndonesia: "Betapa besar penyesalan terhadap hamba-hamba itu, setiap datang seorang rasul kepada mereka, mereka selalu memperolok-olokannya." },
  { nomorAyat: 31, teksArab: "أَلَمْ يَرَوْا كَمْ أَهْلَكْنَا قَبْلَهُمْ مِنَ الْقُرُونِ أَنَّهُمْ إِلَيْهِمْ لَا يَرْجِعُونَ", teksLatin: "Alam yarau kam ahlakna qablahum minal-quruni annahum ilaihim la yarji'un.", teksIndonesia: "Tidakkah mereka mengetahui berapa banyak umat sebelum mereka yang telah Kami binasakan. Mereka (orang-orang yang telah dibinasakan itu) tidak ada yang kembali kepada mereka." },
  { nomorAyat: 32, teksArab: "وَإِنْ كُلٌّ لَمَّا جَمِيعٌ لَدَيْنَا مُحْضَرُونَ", teksLatin: "Wa in kullul lamma jami'ul ladaina muhdarun.", teksIndonesia: "Dan setiap mereka, semuanya akan dihadapkan kepada Kami." },
  { nomorAyat: 33, teksArab: "وَآيَةٌ لَهُمُ الْأَرْضُ الْمَيْتَةُ أَحْيَيْنَاهَا وَأَخْرَجْنَا مِنْهَا حَبًّا فَمِنْهُ يَأْكُلُونَ", teksLatin: "Wa ayatul lahumul-ardul-maitatu ahyainaha wa akhrajna minha habban faminhu ya'kulun.", teksIndonesia: "Dan suatu tanda (kebesaran Allah) bagi mereka adalah bumi yang mati (tandus). Kami hidupkan bumi itu dan Kami keluarkan darinya biji-bijian, maka dari (biji-bijian) itu mereka makan." },
  { nomorAyat: 34, teksArab: "وَجَعَلْنَا فِيهَا جَنَّاتٍ مِنْ نَخِيلٍ وَأَعْنَابٍ وَفَجَّرْنَا فِيهَا مِنَ الْعُيُونِ", teksLatin: "Wa ja'alna fiha jannatim min nakhiliw wa a'nabiw wa fajjarna fiha minal-'uyun.", teksIndonesia: "Dan Kami jadikan padanya di bumi itu kebun-kebun kurma dan anggur dan Kami pancarkan padanya beberapa mata air," },
  { nomorAyat: 35, teksArab: "لِيَأْكُلُوا مِنْ ثَمَرِهِ وَمَا عَمِلَتْهُ أَيْدِيهِمْ ۖ أَفَلَا يَشْكُرُونَ", teksLatin: "Liya'kulu min tsamarihi wa ma 'amilathu aidihim, afala yasykurun.", teksIndonesia: "agar mereka dapat makan dari buahnya, dan dari hasil usaha tangan mereka. Maka mengapa mereka tidak bersyukur?" },
  { nomorAyat: 36, teksArab: "سُبْحَانَ الَّذِي خَلَقَ الْأَزْوَاجَ كُلَّهَا مِمَّا تُنْبِتُ الْأَرْضُ وَمِنْ أَنْفُسِهِمْ وَمِمَّا لَا يَعْلَمُونَ", teksLatin: "Subhanal-ladzi khalaqal-azwaja kullaha mimma tumbitul-ardu wa min anfusihim wa mimma la ya'lamun.", teksIndonesia: "Mahasuci (Allah) yang telah menciptakan semuanya berpasang-pasangan, baik dari apa yang ditumbuhkan oleh bumi dan dari diri mereka sendiri maupun dari apa yang tidak mereka ketahui." },
  { nomorAyat: 37, teksArab: "وَآيَةٌ لَهُمُ اللَّيْلُ نَسْلَخُ مِنْهُ النَّهَارَ فَإِذَا هُمْ مُظْلِمُونَ", teksLatin: "Wa ayatul lahumul-lailu naslakhu minhun-nahara fa idza hum mudzlimun.", teksIndonesia: "Dan suatu tanda (kebesaran Allah) bagi mereka adalah malam; Kami tanggalkan siang dari (malam) itu, maka seketika itu mereka (berada dalam) kegelapan." },
  { nomorAyat: 38, teksArab: "وَالشَّمْسُ تَجْرِي لِمُسْتَقَرٍّ لَهَا ۚ ذَٰلِكَ تَقْدِيرُ الْعَزِيزِ الْعَلِيمِ", teksLatin: "Wasy-syamsu tajri limustaqarril laha, dzalika taqdirul-'azizil-'alim.", teksIndonesia: "dan matahari berjalan di tempat peredarannya. Demikianlah ketetapan (Allah) Yang Mahaperkasa, Maha Mengetahui." },
  { nomorAyat: 39, teksArab: "وَالْقَمَرَ قَدَّرْنَاهُ مَنَازِلَ حَتَّىٰ عَادَ كَالْعُرْجُونِ الْقَدِيمِ", teksLatin: "Wal-qamara qaddarnahu manazila hatta 'ada kal-'urjunil-qadim.", teksIndonesia: "Dan telah Kami tetapkan tempat peredaran bagi bulan, sehingga (setelah ia sampai ke tempat peredaran yang terakhir) kembalilah ia seperti bentuk tandan yang tua." },
  { nomorAyat: 40, teksArab: "لَا الشَّمْسُ يَنْبَغِي لَهَا أَنْ تُدْرِكَ الْقَمَرَ وَلَا اللَّيْلُ سَابِقُ النَّهَارِ ۚ وَكُلٌّ فِي فَلَكٍ يَسْبَحُونَ", teksLatin: "Lasy-syamsu yambaghi laha an tudrikal-qamara wa lal-lailu sabiqun-nahar, wa kullun fi falaki yasbahun.", teksIndonesia: "Tidaklah mungkin bagi matahari mengejar bulan dan malam pun tidak dapat mendahului siang. Masing-masing beredar pada garis edarnya." },
  { nomorAyat: 41, teksArab: "وَآيَةٌ لَهُمْ أَنَّا حَمَلْنَا ذُرِّيَّتَهُمْ فِي الْفُلْكِ الْمَشْحُونِ", teksLatin: "Wa ayatul lahum anna hamalna dhurriyyatahum fil-fulkil-masyhun.", teksIndonesia: "Dan suatu tanda (kebesaran Allah) bagi mereka adalah bahwa Kami mengangkut keturunan mereka dalam kapal yang penuh muatan," },
  { nomorAyat: 42, teksArab: "وَخَلَقْنَا لَهُمْ مِنْ مِثْلِهِ مَا يَرْكَبُونَ", teksLatin: "Wa khalaqna lahum mim mitslihi ma yarkabun.", teksIndonesia: "dan Kami ciptakan (juga) untuk mereka angkutan lain seperti kapal itu yang mereka kendarai." },
  { nomorAyat: 43, teksArab: "وَإِنْ نَشَأْ نُغْرِقْهُمْ فَلَا صَرِيخَ لَهُمْ وَلَا هُمْ يُنْقَذُونَ", teksLatin: "Wa in nasya' nughriqhum fala sarikha lahum wa la hum yunqadzun.", teksIndonesia: "Dan jika Kami menghendaki, Kami tenggelamkan mereka, maka tidak ada penolong bagi mereka dan tidak (pula) mereka diselamatkan," },
  { nomorAyat: 44, teksArab: "إِلَّا رَحْمَةً مِنَّا وَمَتَاعًا إِلَىٰ حِينٍ", teksLatin: "Illa rahmatam minna wa mata'an ilai hin.", teksIndonesia: "melainkan (Kami selamatkan) karena rahmat yang besar dari Kami dan untuk memberikan kesenangan hidup sampai waktu tertentu." },
  { nomorAyat: 45, teksArab: "وَإِذَا قِيلَ لَهُمُ اتَّقُوا مَا بَيْنَ أَيْدِيكُمْ وَمَا خَلْفَكُمْ لَعَلَّكُمْ تُرْحَمُونَ", teksLatin: "Wa idza qila lahumuttaqu ma baina aidikum wa ma khalfakum la'allakum turhamun.", teksIndonesia: "Dan apabila dikatakan kepada mereka, 'Takutlah kamu akan siksa yang di hadapanmu dan siksa yang akan datang agar kamu mendapat rahmat.'" },
  { nomorAyat: 46, teksArab: "وَمَا تَأْتِيهِمْ مِنْ آيَةٍ مِنْ آيَاتِ رَبِّهِمْ إِلَّا كَانُوا عَنْهَا مُعْرِضِينَ", teksLatin: "Wa ma ta'tihim min ayatim min ayati rabbihim illa kanu 'anha mu'ridin.", teksIndonesia: "Dan setiap kali suatu tanda dari tanda-tanda kebesaran Tuhan datang kepada mereka, mereka selalu berpaling darinya." },
  { nomorAyat: 47, teksArab: "وَإِذَا قِيلَ لَهُمْ أَنْفِقُوا مِمَّا رَزَقَكُمُ اللَّهُ قَالَ الَّذِينَ كَفَرُوا لِلَّذِينَ آمَنُوا أَنُطْعِمُ مَنْ لَوْ يَشَاءُ اللَّهُ أَطْعَمَهُ إِنْ أَنْتُمْ إِلَّا فِي ضَلَالٍ مُبِينٍ", teksLatin: "Wa idza qila lahum anfiqu mimma razaqakumullahu qalal-ladzina kafaru lilladzina amanu anut'imu mal lau yasya'ullahu at'amah, in antum illa fi dalalim mubin.", teksIndonesia: "Dan apabila dikatakan kepada mereka, 'Infakkanlah sebagian rezeki yang diberikan Allah kepadamu,' orang-orang yang kafir itu berkata kepada orang-orang yang beriman, 'Apakah kami pantas memberi makan kepada orang-orang yang jika Allah menghendaki Dia akan meberinya makan? Kamu benar-benar dalam kesesatan yang nyata.'" },
  { nomorAyat: 48, teksArab: "وَيَقُولُونَ مَتَىٰ هَٰذَا الْوَعْدُ إِنْ كُنْتُمْ صَادِقِينَ", teksLatin: "Wa yaquluna mata hadzal-wa'du in kuntum sadiqin.", teksIndonesia: "Dan mereka berkata, 'Bilakah janji (hari berbangkit) itu (terjadi) jika kamu orang-orang yang benar?'" },
  { nomorAyat: 49, teksArab: "مَا يَنْظُرُونَ إِلَّا صَيْحَةً وَاحِدَةً تَأْخُذُهُمْ وَهُمْ يَخِصِّمُونَ", teksLatin: "Ma yandzuruna illa saihataw wahidatan ta'khudzubum wa hum yakhissimun.", teksIndonesia: "Mereka hanya menunggu satu teriakan saja yang akan membinasakan mereka ketika mereka sedang bertengkar." },
  { nomorAyat: 50, teksArab: "فَلَا يَسْتَطِيعُونَ تَوْصِيَةً وَلَا إِلَىٰ أَهْلِهِمْ يَرْجِعُونَ", teksLatin: "Fala yastati'una tausiyataw wa la ila ahlihim yarji'un.", teksIndonesia: "Maka mereka tidak mampu membuat suatu wasiat pun dan mereka tidak dapat kembali kepada keluarganya." },
  { nomorAyat: 51, teksArab: "وَنُفِخَ فِي الصُّورِ فَإِذَا هُمْ مِنَ الْأَجْدَاثِ إِلَىٰ رَبِّهِمْ يَنْسِلُونَ", teksLatin: "Wa nufikha fis-suri fa idza hum minal-ajdatsi ila rabbihim yansilun.", teksIndonesia: "Lalu ditiuplah sangkakala, maka seketika itu mereka keluar dari kuburnya (dalam keadaan hidup), menuju kepada Tuhan mereka." },
  { nomorAyat: 52, teksArab: "قَالُوا يَا وَيْلَنَا مَنْ بَعَثَنَا مِنْ مَرْقَدِنَا ۗ هَٰذَا مَا وَعَدَ الرَّحْمَٰنُ وَصَدَقَ الْمُرْسَلُونَ", teksLatin: "Qalu ya wailana mam ba'atsana mim marqadina, hadza ma wa'adar-rahmanu wa sadaqal-mursalun.", teksIndonesia: "Mereka berkata, 'Celakalah kami! Siapakah yang membangkitkan kami dari tempat tidur kami (kubur)?' Inilah yang dijanjikan (Allah) Yang Maha Pengasih dan benarlah rasul-rasul(-Nya)." },
  { nomorAyat: 53, teksArab: "إِنْ كَانَتْ إِلَّا صَيْحَةً وَاحِدَةً فَإِذَا هُمْ جَمِيعٌ لَدَيْنَا مُحْضَرُونَ", teksLatin: "In kanat illa saihataw wahidatan fa idza hum jami'ul ladaina muhdarun.", teksIndonesia: "Teriakan itu hanya sekali saja, maka seketika itu mereka semua dihadapkan kepada Kami (untuk dihisab)." },
  { nomorAyat: 54, teksArab: "فَالْيَوْمَ لَا تُظْلَمُ نَفْسٌ شَيْئًا وَلَا تُجْزَوْنَ إِلَّا مَا كُنْتُمْ تَعْمَلُونَ", teksLatin: "Fal-yauma la tudzlamu nafsun syai'aw wa la tujzauna illa ma kuntum ta'malun.", teksIndonesia: "Maka pada hari itu tidak ada seseorang yang dirugikan sedikit pun dan kamu tidak diberi balasan, kecuali apa yang telah kamu kerjakan." },
  { nomorAyat: 55, teksArab: "إِنَّ أَصْحَابَ الْجَنَّةِ الْيَوْمَ فِي شُغُلٍ فَاكِهُونَ", teksLatin: "Inna as-habal-jannatil-yauma fi syughulin fakihun.", teksIndonesia: "Sesungguhnya penghuni surga pada hari itu bersenang-senang dalam kesibukan (mereka)." },
  { nomorAyat: 56, teksArab: "هُمْ وَأَزْوَاجُهُمْ فِي ظِلَالٍ عَلَى الْأَرَائِكِ مُتَّكِئُونَ", teksLatin: "Hum wa azwajuhum fi dzilalin 'alal-ara'iki muttaki'un.", teksIndonesia: "Mereka dan pasangan-pasangannya berada dalam tempat yang teduh, bersandar di atas dipan-dipan." },
  { nomorAyat: 57, teksArab: "لَهُمْ فِيهَا فَاكِهَةٌ وَلَهُمْ مَا يَدَّعُونَ", teksLatin: "Lahum fiha fakihatuw wa lahum ma yadda'un.", teksIndonesia: "Di surga itu mereka memperoleh buah-buahan dan memperoleh apa saja yang mereka inginkan." },
  { nomorAyat: 58, teksArab: "سَلَامٌ قَوْلًا مِنْ رَبٍّ رَحِيمٍ", teksLatin: "Salamun qaulam mir rabbir rahim.", teksIndonesia: "(Kepada mereka dikatakan), 'Salam,' sebagai ucapan selamat dari Tuhan Yang Maha Penyayang." },
  { nomorAyat: 59, teksArab: "وَامْتَازُوا الْيَوْمَ أَيُّهَا الْمُجْرِمُونَ", teksLatin: "Wamtazul-yauma ayyuhal-mujrimun.", teksIndonesia: "Dan (dikatakan kepada orang-orang kafir), 'Terpisahlah kamu (dari orang-orang mukmin) pada hari ini, wahai orang-orang yang berbuat jahat!'" },
  { nomorAyat: 60, teksArab: "أَلَمْ أَعْهَدْ إِلَيْكُمْ يَا بَنِي آدَمَ أَنْ لَا تَعْبُدُوا الشَّيْطَانَ ۖ إِنَّهُ لَكُمْ عَدُوٌّ مُبِينٌ", teksLatin: "Alam a'had ilaikum ya bani adama al la ta'budusy-syaitan, innahu lakum 'aduwwum mubin.", teksIndonesia: "Bukankah Aku telah memerintahkan kepadamu wahai anak cucu Adam agar kamu tidak menyembah setan? Sungguh, setan itu musuh yang nyata bagi kamu," },
  { nomorAyat: 61, teksArab: "وَأَنِ اعْبُدُونِي ۚ هَٰذَا صِرَاطٌ مُسْتَقِيمٌ", teksLatin: "Wa ani'buduni, hadza siratum mustaqim.", teksIndonesia: "dan hendaklah kamu menyembah-Ku. Inilah jalan yang lurus." },
  { nomorAyat: 62, teksArab: "وَلَقَدْ أَضَلَّ مِنْكُمْ جِبِلًّا كَثِيرًا ۖ أَفَلَمْ تَكُونُوا تَعْقِلُونَ", teksLatin: "Wa laqad adalla minkum jibillan katsira, afalam takunu ta'qilun.", teksIndonesia: "Dan sungguh, ia (setan itu) telah menyesatkan sebagian besar di antara kamu. Maka apakah kamu tidak mengerti?" },
  { nomorAyat: 63, teksArab: "هَٰذِهِ جَهَنَّمُ الَّتِي كُنْتُمْ تُوعَدُونَ", teksLatin: "Hadzihi jahannamul-lati kuntum tu'adun.", teksIndonesia: "Inilah (neraka) Jahanam yang dahulu diancamkan kepadamu." },
  { nomorAyat: 64, teksArab: "اصْلَوْهَا الْيَوْمَ بِمَا كُنْتُمْ تَكْفُرُونَ", teksLatin: "Islauhal-yauma bima kuntum takfurun.", teksIndonesia: "Masuklah ke dalamnya pada hari ini karena dahulu kamu mengingkarinya." },
  { nomorAyat: 65, teksArab: "الْيَوْمَ نَخْتِمُ عَلَىٰ أَفْوَاهِهِمْ وَتُكَلِّمُنَا أَيْدِيهِمْ وَتَشْهَدُ أَرْجُلُهُمْ بِمَا كَانُوا يَكْسِبُونَ", teksLatin: "Al-yauma nakhtimu 'ala afwahihim wa tukallimuna aidihim wa tasyhadu arjuluhum bima kanu yaksibun.", teksIndonesia: "Pada hari ini Kami tutup mulut mereka; tangan mereka akan berkata kepada Kami dan kaki mereka akan memberi kesaksian terhadap apa yang dahulu mereka kerjakan." },
  { nomorAyat: 66, teksArab: "وَلَوْ نَشَاءُ لَطَمَسْنَا عَلَىٰ أَعْيُنِهِمْ فَاسْتَبَقُوا الصِّرَاطَ فَأَنَّىٰ يُبْصِرُونَ", teksLatin: "Wa lau nasya'u latamasna 'ala a'yunihim fastabaqus-sirata fa-anna yubsirun.", teksIndonesia: "Dan jika Kami menghendaki, pastilah Kami hapuskan (butakan) mata mereka; lalu mereka berlomba-lomba (mencari) jalan. Maka bagaimana mungkin mereka dapat melihat?" },
  { nomorAyat: 67, teksArab: "وَلَوْ نَشَاءُ لَمَسَخْنَاهُمْ عَلَىٰ مَكَانَتِهِمْ فَمَا اسْتَطَاعُوا مُضِيًّا وَلَا يَرْجِعُونَ", teksLatin: "Wa lau nasya'u lamasakhnahum 'ala makanatihim famastata'u mudiyyaw wa la yarji'un.", teksIndonesia: "Dan jika Kami menghendaki, pastilah Kami ubah bentuk mereka di tempat mereka berada, sehingga mereka tidak sanggup meneruskan perjalanan dan juga tidak dapat kembali." },
  { nomorAyat: 68, teksArab: "وَمَنْ نُعَمِّرْهُ نُنَكِّسْهُ فِي الْخَلْقِ ۖ أَفَلَا يَعْقِلُونَ", teksLatin: "Wa man nu'ammirhu nunakkishu fil-khalq, afala ya'qilun.", teksIndonesia: "Dan barang siapa yang Kami panjangkan umurnya niscaya Kami kembalikan dia kepada kejadiannya (kembali lemah). Maka apakah mereka tidak mengerti?" },
  { nomorAyat: 69, teksArab: "وَمَا عَلَّمْنَاهُ الشِّعْرَ وَمَا يَنْبَغِي لَهُ ۚ إِنْ هُوَ إِلَّا ذِكْرٌ وَقُرْآنٌ مُبِينٌ", teksLatin: "Wa ma 'allamnahusy-syi'ra wa ma yambaghi lah, in huwa illa dzikruw wa qur'anum mubin.", teksIndonesia: "Dan Kami tidak mengajarkan syair kepadanya (Muhammad) dan bersyair itu tidaklah layak baginya. Al-Qur'an itu tidak lain hanyalah pelajaran dan kitab yang jelas," },
  { nomorAyat: 70, teksArab: "لِيُنْذِرَ مَنْ كَانَ حَيًّا وَيَحِقَّ الْقَوْلُ عَلَى الْكَافِرِينَ", teksLatin: "Liyundzira man kana hayyaw wa yahiqqal-qaulu 'alal-kafirin.", teksIndonesia: "agar dia (Muhammad) memberi peringatan kepada orang-orang yang hidup (hatinya) dan agar pastilah ketetapan (azab) terhadap orang-orang kafir." },
  { nomorAyat: 71, teksArab: "أَوَلَمْ يَرَوْا أَنَّا خَلَقْنَا لَهُمْ مِمَّا عَمِلَتْ أَيْدِينَا أَنْعَامًا فَهُمْ لَهَا مَالِكُونَ", teksLatin: "A wa lam yarau anna khalaqna lahum mimma 'amilat aidina an'aman fahum laha malikun.", teksIndonesia: "Dan tidakkah mereka melihat bahwa Kami telah menciptakan hewan ternak untuk mereka, yaitu sebagian dari apa yang telah Kami ciptakan dengan kekuasaan Kami, lalu mereka menguasainya?" },
  { nomorAyat: 72, teksArab: "وَذَلَّلْنَاهَا لَهُمْ فَمِنْهَا رَكُوبُهُمْ وَمِنْهَا يَأْكُلُونَ", teksLatin: "Wa dzallalnaha lahum faminha rakubuhum wa minha ya'kuluun.", teksIndonesia: "Dan Kami tundukkan (hewan-hewan itu) untuk mereka; maka sebagian di antaranya menjadi tunggangan mereka dan sebagian lagi mereka makan." },
  { nomorAyat: 73, teksArab: "وَلَهُمْ فِيهَا مَنَافِعُ وَمَشَارِبُ ۖ أَفَلَا يَشْكُرُونَ", teksLatin: "Wa lahum fiha manafi'u wa masyarib, afala yasykurun.", teksIndonesia: "Dan mereka memperoleh berbagai manfaat dan minuman darinya. Maka mengapa mereka tidak bersyukur?" },
  { nomorAyat: 74, teksArab: "وَاتَّخَذُوا مِنْ دُونِ اللَّهِ آلِهَةً لَعَلَّهُمْ يُنْصَرُونَ", teksLatin: "Wattakhadzu min dunillahi alihatal la'allahum yunsarun.", teksIndonesia: "Dan mereka mengambil sesembahan selain Allah agar mereka mendapat pertolongan." },
  { nomorAyat: 75, teksArab: "لَا يَسْتَطِيعُونَ نَصْرَهُمْ وَهُمْ لَهُمْ جُنْدٌ مُحْضَرُونَ", teksLatin: "La yastati'una nasrahum wa hum lahum jundum muhdarun.", teksIndonesia: "Sesembahan itu tidak dapat menolong mereka; padahal sesembahan itu menjadi prajurit yang disiapkan untuk menjaga mereka." },
  { nomorAyat: 76, teksArab: "فَلَا يَحْزُنْكَ قَوْلُهُمْ ۘ إِنَّا نَعْلَمُ مَا يُسِرُّونَ وَمَا يُعْلِنُونَ", teksLatin: "Fala yahzunka qauluhum, inna na'lamu ma yusirruna wa ma yu'linun.", teksIndonesia: "Maka jangan sampai ucapan mereka membuat engkau (Muhammad) bersedih hati. Sungguh, Kami mengetahui apa yang mereka rahasiakan dan apa yang mereka nyatakan." },
  { nomorAyat: 77, teksArab: "أَوَلَمْ يَرَ الْإِنْسَانُ أَنَّا خَلَقْنَاهُ مِنْ نُطْفَةٍ فَإِذَا هُوَ خَصِيمٌ مُبِينٌ", teksLatin: "A wa lam yaral-insanu anna khalaqnahu min nutfatin fa idza huwa khasimum mubin.", teksIndonesia: "Dan tidakkah manusia memperhatikan bahwa Kami meciptakannya dari setetes mani, ternyata dia menjadi musuh yang nyata!" },
  { nomorAyat: 78, teksArab: "وَضَرَبَ لَنَا مَثَلًا وَنَسِيَ خَلْقَهُ ۖ قَالَ مَنْ يُحْيِي الْعِظَامَ وَهِيَ رَمِيمٌ", teksLatin: "Wa daraba lana matsalaw wa nasiya khalqah, qala may yuhyil-'idzama wa hiya ramim.", teksIndonesia: "Dan dia membuat perumpamaan bagi Kami dan melupakan kejadiannya; dia berkata, 'Siapakah yang dapat menghidupkan tulang-belulang yang telah hancur luluh?'" },
  { nomorAyat: 79, teksArab: "قُلْ يُحْيِيهَا الَّذِي أَنْشَأَهَا أَوَّلَ مَرَّةٍ ۖ وَهُوَ بِكُلِّ خَلْقٍ عَلِيمٌ", teksLatin: "Qul yuhyihalladzi ansya'aha awwala marrah, wa huwa bikulli khalqin 'alim.", teksIndonesia: "Katakanlah (Muhammad), 'Yang akan menghidupkannya ialah (Allah) yang menciptakannya pertama kali. Dan Dia Maha Mengetahui tentang segala makhluk,'" },
  { nomorAyat: 80, teksArab: "الَّذِي جَعَلَ لَكُمْ مِنَ الشَّجَرِ الْأَخْضَرِ نَارًا فَإِذَا أَنْتُمْ مِنْهُ تُوقِدُونَ", teksLatin: "Alladzi ja'ala lakum minasy-syajaril-akhdari naran fa idza antum minhu tuqidun.", teksIndonesia: "(yaitu) Allah yang menjadikan api untukmu dari kayu yang hijau, maka seketika itu kamu nyalakan (api) dari kayu itu." },
  { nomorAyat: 81, teksArab: "أَوَلَيْسَ الَّذِي خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ بِقَادِرٍ عَلَىٰ أَنْ يَخْلُقَ مِثْلَهُمْ ۚ بَلَىٰ وَهُوَ الْخَلَّاقُ الْعَلِيمُ", teksLatin: "A wa laisalladzi khalaqas-samawati wal-arda biqadirin 'ala ay yakhluqa mitslahum, bala wa huwal-khallaqul-'alim.", teksIndonesia: "Dan bukankah (Allah) yang menciptakan langit dan bumi, berkuasa menciptakan kembali jasad-jasad mereka yang telah hancur itu? Benar, Dia berkuasa. Dan Dialah Maha Pencipta, Maha Mengetahui." },
  { nomorAyat: 82, teksArab: "إِنَّمَا أَمْرُهُ إِذَا أَرَادَ شَيْئًا أَنْ يَقُولَ لَهُ كُنْ فَيَكُونُ", teksLatin: "Innama amruhu idza arada syai'an ay yaqula lahu kun fa yakun.", teksIndonesia: "Sesungguhnya urusan-Nya apabila Dia menghendaki sesuatu hanyalah berkata kepadanya, 'Jadilah!' Maka jadilah sesuatu itu." },
  { nomorAyat: 83, teksArab: "فَسُبْحَانَ الَّذِي بِيَدِهِ مَلَكُوتُ كُلِّ شَيْءٍ وَإِلَيْهِ تُرْجَعُونَ", teksLatin: "Fa subhanal-ladzi biyadihi malakutu kulli syai'iw wa ilaihi turja'un.", teksIndonesia: "Maka Mahasuci (Allah) yang di tangan-Nya kekuasaan atas segala sesuatu dan kepada-Nyalah kamu dikembalikan." }
];

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
    arab: "لِلّٰهِ مَا فِي السَّمٰوٰتِ وَمَا فِي الْأَرْضِ ۗ وَإِنْ تُبْدُوْا مَا فِيْ أَنْفُسِكُمْ أَوْ تُخْفُوْهُ يُحَاسِبْكُمْ بِهِ اللّٰهُ ۗ فَيَغْفِرُ لِمَنْ يَّشَآءُ وَيُعَذِّبُ مَنْ يَّشَآءُ ۗ وَاللّٰهُ عَلٰى كُلِّ شَيْءٍ قَدِيْرٌ \n\n آمَنَ الرَّسُوْلُ بِمَآ أُنْزِلَ إِلَيْهِ مِنْ رَّبِّهِ وَالْمُؤْمِنُوْنَ ۗ كُلٌّ آمَنَ بِاللّٰهِ وَمَلٰۤئِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ ۗ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّنْ رُّسُلِهِ ۚ وَقَالُوْا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيْرُ \n\n لَا يُكَلِّفُ اللّٰهُ نَفْسًا أِلَّا وُسْعَهَا ۗ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَآ إِنْ نَّسِيْنَآ أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَآ إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِيْنَ مِنْ قَبْلِنَا ۚ رَبَّنَا وَلَا تَحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا (٧x) أَنْتَ مَوْلٰىنَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكٰفِرِيْنَ", 
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 theme-text-primary font-sans">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap');
        .font-quran {
          font-family: 'Amiri', 'Traditional Arabic', 'Scheherazade New', serif;
        }
      `}</style>

      {/* Navigation Header */}
      <GlassCard className="p-4 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold theme-text-accent hover:opacity-80 transition-opacity cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Utama
        </Link>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setFontSize(prev => Math.max(22, prev - 2))}
            className="p-2 theme-bg-tertiary rounded-xl theme-text-primary text-xs font-bold border theme-border flex items-center gap-1 cursor-pointer"
            title="Kecilkan Teks"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setFontSize(prev => Math.min(54, prev + 2))}
            className="p-2 theme-bg-tertiary rounded-xl theme-text-primary text-xs font-bold border theme-border flex items-center gap-1 cursor-pointer"
            title="Besarkan Teks"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </GlassCard>

      {/* Tabs */}
      <GlassCard className="p-1.5 grid grid-cols-3 gap-2">
        <button
          onClick={() => setActiveTab('yasin')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'yasin' 
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black' 
              : 'theme-text-secondary hover:theme-text-primary'
          }`}
        >
          Surat Yasin (83)
        </button>
        <button
          onClick={() => setActiveTab('tahlil')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'tahlil' 
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black' 
              : 'theme-text-secondary hover:theme-text-primary'
          }`}
        >
          Tahlil
        </button>
        <button
          onClick={() => setActiveTab('doa')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'doa' 
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black' 
              : 'theme-text-secondary hover:theme-text-primary'
          }`}
        >
          Doa
        </button>
      </GlassCard>

      {/* Title */}
      <div className="text-center space-y-1 py-2">
        <h2 className="text-base font-black uppercase tracking-wider theme-text-primary flex items-center justify-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          {activeTab === 'yasin' && 'Surah YaSiin (Lengkap 83 Ayat)'}
          {activeTab === 'tahlil' && 'Tahlil'}
          {activeTab === 'doa' && 'Doa Tahlil'}
        </h2>
        <p className="text-xs theme-text-secondary font-semibold">
          Susunan Resmi: Tawassul → Ayat Pilihan → Istighfar → Shalawat → Tasbih → Tahlil → Doa
        </p>
      </div>

      {/* TAB 1: YASIN */}
      {activeTab === 'yasin' && (
        <div className="space-y-4">
          {YASIN_LOKAL.map((item) => (
            <GlassCard key={item.nomorAyat} className="p-5 sm:p-6 space-y-4 shadow-md">
              <div className="flex justify-between items-center border-b theme-border pb-3">
                <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-mono text-xs font-black flex items-center justify-center shadow-sm">
                  {item.nomorAyat}
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wide">Surah YaSiin : Ayat {item.nomorAyat}</span>
              </div>

              <p 
                className="text-right font-quran theme-text-primary py-3 font-bold whitespace-pre-line"
                style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize * 2.2}px` }}
                dir="rtl"
              >
                {item.teksArab}
              </p>

              <div className="space-y-1.5 pt-3 border-t theme-border">
                {item.teksLatin && (
                  <p className="text-xs font-bold text-emerald-400 italic font-mono">
                    {item.teksLatin}
                  </p>
                )}
                {item.teksIndonesia && (
                  <p className="text-xs theme-text-secondary leading-relaxed font-sans font-medium">
                    "{item.teksIndonesia}"
                  </p>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* TAB 2: TAHLIL GUNUNG JATI */}
      {activeTab === 'tahlil' && (
        <div className="space-y-4">
          {TAHLIL_GUNUNGJATI.map((item) => (
            <GlassCard key={item.id} className="p-5 sm:p-6 space-y-4 shadow-md">
              <div className="flex justify-between items-center border-b theme-border pb-3">
                <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-mono text-xs font-black flex items-center justify-center shadow-sm">
                  {item.id}
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wide">Urutan Tahlil #{item.id}</span>
              </div>

              <p 
                className="text-right font-quran theme-text-primary py-3 font-bold whitespace-pre-line"
                style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize * 2.2}px` }}
                dir="rtl"
              >
                {item.arab}
              </p>

              <div className="space-y-1.5 pt-3 border-t theme-border">
                <p className="text-xs font-bold text-emerald-400 italic font-mono">
                  {item.latin}
                </p>
                <p className="text-xs theme-text-secondary leading-relaxed font-sans font-medium">
                  "{item.indo}"
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* TAB 3: DOA TAHLIL */}
      {activeTab === 'doa' && (
        <div className="space-y-4">
          {DOA_GUNUNGJATI.map((item) => (
            <GlassCard key={item.id} className="p-5 sm:p-6 space-y-4 shadow-md">
              <div className="flex justify-between items-center border-b theme-border pb-3">
                <span className="w-8 h-8 rounded-full bg-amber-600 text-white font-mono text-xs font-black flex items-center justify-center shadow-sm">
                  {item.id}
                </span>
                <span className="text-[11px] font-mono font-bold theme-text-accent uppercase tracking-wide">Doa Haul Cirebon #{item.id}</span>
              </div>

              <p 
                className="text-right font-quran theme-text-primary py-3 font-bold whitespace-pre-line"
                style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize * 2.2}px` }}
                dir="rtl"
              >
                {item.arab}
              </p>

              <div className="space-y-1.5 pt-3 border-t theme-border">
                <p className="text-xs font-bold text-emerald-400 italic font-mono">
                  {item.latin}
                </p>
                <p className="text-xs theme-text-secondary leading-relaxed font-sans font-medium">
                  "{item.indo}"
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
