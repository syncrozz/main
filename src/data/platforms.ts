import { PlatformItem, BenefitItem, EcosystemStep, CategoryDetail } from '../types';

export const PLATFORMS_DATA: PlatformItem[] = [
  {
    id: 'staff-attend',
    name: 'STAFF',
    subName: 'ATTEND',
    tagline: 'Sistem kehadiran staf universal untuk institusi.',
    description: 'Sistem log kehadiran staf digital tanpa sentuh berasaskan geolokasi & kod selamat untuk institusi, sekolah, dan syarikat moden.',
    category: 'Campus',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    accentColor: '#2563EB',
    logoBg: 'from-blue-600 to-indigo-600',
    iconName: 'UserCheck',
    features: [
      'Pendaftaran kehadiran pantas berasaskan GPS & QR kod',
      'Laporan kehadiran harian & bulanan berautomatik',
      'Pengurusan cuti, kebenaran & justifikasi lewat secara digital',
      'Eksport laporan format Excel & PDF mengikut piawaian institusi'
    ],
    audience: ['Institusi Pendidikan', 'Pejabat Kerajaan', 'Syarikat Swasta', 'Pusat Latihan'],
    url: 'https://syncrozz.com/staff-attend',
    isPopular: true,
    status: 'Active'
  },
  {
    id: 'student-attend',
    name: 'STUDENT',
    subName: 'ATTEND',
    tagline: 'Sistem kehadiran pelajar yang mudah & pintar.',
    description: 'Platform pemantauan kehadiran pelajar berpusat yang membantu guru dan pentadbir mengesan kehadiran serta analisis rekod secara real-time.',
    category: 'Education',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    accentColor: '#0284C7',
    logoBg: 'from-sky-500 to-blue-600',
    iconName: 'GraduationCap',
    features: [
      'Imbasan kad pelajar / QR code peribadi',
      'Notifikasi kehadiran kepada pihak pentadbir dan penjaga',
      'Dashboard analisis peratus kehadiran setiap kelas',
      'Integrasi lancar dengan rekod pangkalan data pelajar'
    ],
    audience: ['Sekolah Kebangsaan & Menengah', 'Kolej Vokasional', 'Institusi Pengajian Tinggi', 'Pusat Tuisyen'],
    isPopular: true,
    status: 'Active'
  },
  {
    id: 'class-attend',
    name: 'CLASS',
    subName: 'ATTEND',
    tagline: 'Sistem kehadiran kelas untuk PdP lebih efektif.',
    description: 'Sistem khusus untuk pengajar merekod kehadiran setiap sesi PdP / kuliah secara spesifik mengikut subjek, waktu, dan topik pembelajaran.',
    category: 'Education',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    accentColor: '#4F46E5',
    logoBg: 'from-indigo-500 to-purple-600',
    iconName: 'BookOpenCheck',
    features: [
      'Rekod kehadiran mengikut jadual waktu dan sesi kelas',
      'Pengesanan pelajar cicir / tidak hadir subjek tertentu',
      'Buku rekod mengajar digital serba lengkap',
      'Statistik komprehensif untuk pensyarah dan guru'
    ],
    audience: ['Guru Matapelajaran', 'Pensyarah Kolej/Universiti', 'Penyelaras Jadual Waktu'],
    isPopular: true,
    status: 'Active'
  },
  {
    id: 'syncrozz-qr',
    name: 'SYNCROZZ',
    subName: 'QR',
    tagline: 'QR Code dinamik untuk pelbagai kegunaan.',
    description: 'Penjana dan pengurus kod QR pintar dengan sokongan kod dinamik berparameter, statistik imbasan masa nyata, dan penyesuaian reka bentuk visual.',
    category: 'Productivity',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    accentColor: '#0891B2',
    logoBg: 'from-cyan-500 to-blue-600',
    iconName: 'QrCode',
    features: [
      'Cipta QR Kod Dinamik yang boleh dikemaskini bila-bila masa',
      'Analisis statistik lokasi & jumlah imbasan pengunjung',
      'Custom branding dengan logo dan warna organisasi',
      'Sokongan format fail beresolusi tinggi (SVG, PNG, PDF)'
    ],
    audience: ['Pengurus Acara', 'Pendidik', 'Perniagaan', 'Pentadbir'],
    isPopular: true,
    status: 'Active'
  },
  {
    id: 'urusteam',
    name: 'URUS',
    subName: 'TEAM',
    tagline: 'Urus program, kolaborasi & dokumentasi bersepadu.',
    description: 'Hab pengurusan kerja berpasukan, penugasan aktiviti, pemantauan status projek, dan arkib dokumentasi digital tanpa kekeliruan.',
    category: 'Productivity',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    accentColor: '#E11D48',
    logoBg: 'from-rose-500 to-orange-500',
    iconName: 'Layers',
    features: [
      'Papan tugasan kolaboratif (Kanban & Senarai)',
      'Pengurusan kertas kerja & pelaporan program digital',
      'Penetapan jawatankuasa dan peranan ahli pasukan',
      'Notifikasi tarikh akhir & pencapaian tugasan automatik'
    ],
    audience: ['Jawatankuasa Program', 'Kelab & Persatuan', 'Pasukan Projek Institusi', 'Urusetia Acara'],
    status: 'Active'
  },
  {
    id: 'kpm-match',
    name: 'KPM',
    subName: 'MATCH',
    tagline: 'Padanan tepat, masa depan cerah.',
    description: 'Sistem pintar pemadanan kriteria kelayakan, laluan pendidikan, program tajaan, dan peluang perkembangan kerjaya pelajar.',
    category: 'Education',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    accentColor: '#2563EB',
    logoBg: 'from-blue-600 to-sky-500',
    iconName: 'Compass',
    features: [
      'Algoritma semakan syarat kelayakan akademik secara pantas',
      'Panduan laluan bidang pengajian & kerjaya masa depan',
      'Pangkalan data institusi & kursus yang sentiasa dikemaskini',
      'Laporan perbandingan program untuk rujukan kaunselor'
    ],
    audience: ['Pelajar SPM / STPM', 'Guru Bimbingan & Kaunseling', 'Ibu Bapa', 'Penyelidik Pendidikan'],
    status: 'Active'
  },
  {
    id: 'syncrozz-link',
    name: 'SYNCROZZ',
    subName: 'LINK',
    tagline: 'Pautan pintar untuk kongsi tanpa batas.',
    description: 'Pengurus mikro-laman dan pengagregat pautan digital yang kemas untuk perkongsian maklumat rasmi, dokumen, media sosial, dan direktori.',
    category: 'Productivity',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accentColor: '#059669',
    logoBg: 'from-emerald-500 to-teal-600',
    iconName: 'Link2',
    features: [
      'Satu pautan bio berpusat untuk semua saluran organisasi',
      'Tema reka bentuk moden mengikut identiti korporat',
      'Sokongan pautan pantas WhatsApp, borang, dan PDF',
      'Statistik klik bagi setiap pautan yang dipaparkan'
    ],
    audience: ['Organisasi', 'Penganjur Acara', 'Institusi', 'Pencipta Kandungan'],
    status: 'Active'
  },
  {
    id: 'rc-fun-ride',
    name: 'RC FUN',
    subName: 'RIDE',
    tagline: 'Control board untuk pengalaman RC yang hebat.',
    description: 'Sistem pengurusan perlumbaan dan acara kenderaan kawalan jauh (RC) yang menguruskan pendaftaran peserta, undian petak, dan jadual acara.',
    category: 'Community',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    accentColor: '#2563EB',
    logoBg: 'from-blue-600 to-cyan-500',
    iconName: 'Gamepad2',
    features: [
      'Pendaftaran kategori & kenderaan RC secara digital',
      'Pengurusan jadual heat, semi-final dan pusingan akhir',
      'Papan skor langsung untuk peserta dan penonton',
      'Integrasi pangkalan data komuniti peminat RC'
    ],
    audience: ['Komuniti RC Malaysia', 'Penganjur Acara Sukan', 'Kelab Hobi', 'Peserta Perlumbaan'],
    status: 'Active'
  },
  {
    id: 'rc-zone',
    name: 'RC',
    subName: 'ZONE',
    tagline: 'Training System Precision Time. Pure Performance.',
    description: 'Sistem latihan masa persis dan telemetri prestasi untuk penggemar sukan motor RC mengukur kelajuan, catatan masa pusingan (lap time), dan konsistensi.',
    category: 'Community',
    badgeColor: 'bg-slate-700 text-slate-100 border-slate-600',
    accentColor: '#1E293B',
    logoBg: 'from-slate-800 to-slate-900',
    iconName: 'Timer',
    features: [
      'Catatan masa lap time berketepatan milisaat',
      'Analisis konsistensi pemanduan & graf kelajuan',
      'Mod latihan solo & perbandingan rekod litar',
      'Penyegerakan masa nyata dengan sensor transponder'
    ],
    audience: ['Pemandu RC Profesional', 'Pusat Litar Latihan', 'Jurulatih Sukan RC'],
    status: 'Active'
  },
  {
    id: 'peluang-pentas',
    name: 'PELUANG',
    subName: 'PENTAS',
    tagline: 'Komuniti • Bakat • Pentas. Kembangkan bakat, raih peluang.',
    description: 'Platform rangkaian dan pemadanan bakat seni, persembahan, dan kepimpinan belia dengan penganjur acara, festival, dan majlis rasmi.',
    category: 'Community',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    accentColor: '#D97706',
    logoBg: 'from-amber-500 to-orange-600',
    iconName: 'Sparkles',
    features: [
      'Profil portfolio bakat dan artis komuniti berpusat',
      'Papan tawaran peluang persembahan & aktiviti rasmi',
      'Sistem permohonan dan audisi dalam talian',
      'Rangkaian sokongan bakat muda dan institusi'
    ],
    audience: ['Penggiat Seni & Belia', 'Penganjur Festival & Acara', 'Institusi Pendidikan', 'Komuniti Kreatif'],
    status: 'Active'
  }
];

export const TRUST_BENEFITS: BenefitItem[] = [
  {
    id: 'easy',
    title: 'Mudah Digunakan',
    description: 'Interface yang ringkas, responsif, dan mudah difahami tanpa memerlukan latihan teknikal yang rumit.',
    iconName: 'Smartphone',
    color: 'blue'
  },
  {
    id: 'integrated',
    title: 'Sistem Bersepadu',
    description: 'Menghubungkan proses, kakitangan, dan maklumat penting dalam satu ekosistem digital yang harmoni.',
    iconName: 'Network',
    color: 'indigo'
  },
  {
    id: 'secure',
    title: 'Selamat & Dipercayai',
    description: 'Dibina dengan standard keselamatan data yang ketat, sandaran berkala, dan kestabilan sistem optimum.',
    iconName: 'ShieldCheck',
    color: 'sky'
  },
  {
    id: 'scalable',
    title: 'Boleh Diskalakan',
    description: 'Platform boleh berkembang mengikut saiz dan keperluan organisasi dari peringkat kecil ke institusi besar.',
    iconName: 'TrendingUp',
    color: 'cyan'
  }
];

export const CATEGORIES_DATA: CategoryDetail[] = [
  {
    id: 'Education',
    name: 'Education',
    tagline: 'Penyelesaian Pengurusan Pengajaran & Pembelajaran',
    description: 'Direka khusus untuk memudahkan operasi bilik darjah, pemantauan kehadiran pelajar, rekod PdP harian, dan panduan laluan akademik berstruktur.',
    iconName: 'GraduationCap',
    color: 'from-blue-600 to-indigo-600',
    count: 3,
    highlightedPlatforms: ['Class Attend', 'Student Attend', 'KPM Match']
  },
  {
    id: 'Campus',
    name: 'Campus',
    tagline: 'Operasi Institusi & Pengurusan Warga Organisasi',
    description: 'Menyediakan infrastruktur digital bersepadu untuk tadbir urus staf, pematuhan polisi kehadiran, serta pengurusan program institusi.',
    iconName: 'Building2',
    color: 'from-indigo-600 to-purple-600',
    count: 2,
    highlightedPlatforms: ['Staff Attend', 'URUSTEAM']
  },
  {
    id: 'Productivity',
    name: 'Productivity',
    tagline: 'Alat Kerja Pintar, Aliran Maklumat & Komunikasi',
    description: 'Menghapuskan halangan komunikasi dan proses manual melalui pautan pintar, penjana kod QR dinamik, dan pengurusan tugas berpasukan.',
    iconName: 'Zap',
    color: 'from-cyan-600 to-blue-600',
    count: 3,
    highlightedPlatforms: ['SYNCROZZ QR', 'SYNCROZZ Link', 'URUSTEAM']
  },
  {
    id: 'Community',
    name: 'Community',
    tagline: 'Pemerkasaan Komuniti, Acara & Bakat Baharu',
    description: 'Platform yang menyatukan komuniti hobi, sukan kenderaan kawalan jauh (RC), dan ekosistem pencarian bakat kreatif berimpak tinggi.',
    iconName: 'Users',
    color: 'from-amber-600 to-orange-600',
    count: 3,
    highlightedPlatforms: ['RC Fun Ride', 'RC Zone', 'Peluang Pentas']
  },
  {
    id: 'Innovation',
    name: 'Innovation',
    tagline: 'Penyelesaian Digital Berteknologi Khusus & Eksperimental',
    description: 'Inisiatif teknologi terkehadapan yang menerapkan pengesahan berparameter tinggi, telemetri tepat, dan analitik moden.',
    iconName: 'Lightbulb',
    color: 'from-violet-600 to-fuchsia-600',
    count: 2,
    highlightedPlatforms: ['SYNCROZZ QR', 'RC Zone']
  }
];

export const WHY_SYNCROZZ_PRINCIPLES = [
  {
    title: 'Simple',
    subtitle: 'Mudah & Intuitif',
    description: 'Teknologi yang tidak membebankan pengguna. Setiap antara muka direka seringkas mungkin supaya sesiapa sahaja boleh menggunakannya serta-merta tanpa manual tebal.',
    icon: 'Sparkles',
    highlight: 'Zero Steep Learning Curve'
  },
  {
    title: 'Practical',
    subtitle: 'Berimpak Sebenar',
    description: 'Dibina berdasarkan keperluan sebenar di lapangan. Kami menyelesaikan isu harian pendidik dan organisasi seperti kertas kerja bertimbun dan rekod berselerak.',
    icon: 'CheckCircle2',
    highlight: 'Real-world problem solving'
  },
  {
    title: 'Connected',
    subtitle: 'Ekosistem Harmoni',
    description: 'Platform yang boleh bekerja sebagai satu ekosistem bersatu. Data mengalir lancar antara modul kehadiran, kod QR, dan papan pemuka.',
    icon: 'GitMerge',
    highlight: 'Seamless interoperability'
  },
  {
    title: 'Scalable',
    subtitle: 'Tumbuh Bersama Anda',
    description: 'Boleh berkembang bersama keperluan organisasi. Bermula daripada satu unit kecil sehingga kepada pengurusan menyeluruh peringkat cawangan atau negeri.',
    icon: 'Maximize2',
    highlight: 'Enterprise-grade scalability'
  }
];

export const ECOSYSTEM_FLOW_STEPS: EcosystemStep[] = [
  {
    stepNumber: '01',
    title: 'People',
    subTitle: 'Pendidik, Pentadbir & Komuniti',
    description: 'Pusat utama ekosistem. Pengguna berinteraksi dengan mudah melalui telefon pintar, tablet, atau komputer riba tanpa kekangan sistem.',
    iconName: 'Users',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    details: ['Guru & Pensyarah', 'Kakitangan Pentadbiran', 'Pelajar & Ibu Bapa', 'Komuniti & Belia']
  },
  {
    stepNumber: '02',
    title: 'Platform',
    subTitle: 'Aplikasi Khusus SYNCROZZ',
    description: 'Siri modul pintar (Staff Attend, Student Attend, SYNCROZZ QR, URUSTEAM, dsb) memproses input secara automatik.',
    iconName: 'AppWindow',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    details: ['Imbasan QR Dinamik', 'Rekod Kehadiran Pintar', 'Pautan Berpusat', 'Bilik Perancangan PdP']
  },
  {
    stepNumber: '03',
    title: 'Data',
    subTitle: 'Penyatuan & Keselamatan Maklumat',
    description: 'Semua rekod diselaraskan secara berpusat dengan keselamatan tinggi, menghapuskan duplikasi maklumat.',
    iconName: 'Database',
    color: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    details: ['Pangkalan Data Berpusat', 'Keselamatan Terjamin', 'Sandaran Masa Nyata', 'Struktur Bersih']
  },
  {
    stepNumber: '04',
    title: 'Productivity',
    subTitle: 'Pengurangan Beban Manual',
    description: 'Menjimatkan masa pengurusan harian, menghapuskan borang kertas, dan mempercepatkan penjanaan laporan.',
    iconName: 'Gauge',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    details: ['Laporan Auto-Generate', 'Penjimatan Kertas 90%', 'Sifar Ralat Salinan', 'Maklum Balas Pantas']
  },
  {
    stepNumber: '05',
    title: 'Impact',
    subTitle: 'Kecemerlangan Digital & Keputusan Tepat',
    description: 'Pengurusan institusi yang lebih cekap, telus, dan berdaya saing berteraskan wawasan data bermakna.',
    iconName: 'Trophy',
    color: 'bg-amber-50 text-amber-600 border-amber-200',
    details: ['Wawasan Strategik', 'Keputusan Pantas', 'Kepuasan Warga Kerja', 'Kelestarian Digital']
  }
];
