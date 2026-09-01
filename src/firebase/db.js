// Firebase Firestore Database Client (Zero-bundle REST API + Local Fallback)
import { firebaseConfig, isFirebaseConfigured } from './config.js';

// Local Storage Cache Keys
const STORAGE_KEYS = {
  PROJECTS: 'biplob_art_portfolio_projects',
  SKILLS: 'biplob_art_skills_data',
  MESSAGES: 'biplob_art_cached_inquiries',
  SETTINGS: 'biplob_art_site_settings',
  ANALYTICS: 'biplob_art_analytics_data'
};

// Default Seed Data for Projects
export const DEFAULT_PROJECTS = {
  'p1': {
    id: 'p1',
    title: 'Street ThreadX — Urban Streetwear Lineup',
    category: 'Streetwear Campaign',
    categoryBadge: 'STREET THREADX',
    filterCategory: 'streetwear pod',
    imageUrl: './portfolio/street-threadx-collection.png',
    liveUrl: 'https://www.behance.net/biplob-art',
    githubUrl: 'https://github.com',
    desc: 'High-impact oversized streetwear t-shirt collection featuring modern cyber typography ("FOCUS ON THE GOALS", "UNSTOPPABLE", "explore", "STRONGER", "NEXT LEVEL") engineered for Street ThreadX.',
    modalCategory: 'Streetwear Apparel Campaign (Street ThreadX)',
    techStack: ['Adobe Illustrator', 'Screen Print', 'Color Separation', 'Tech Pack'],
    isFeatured: true,
    views: 420
  },
  'p2': {
    id: 'p2',
    title: '"Never Give Up — Created Your Own Future" Tee',
    category: 'Custom Lettering & Vector',
    categoryBadge: 'TYPOGRAPHY ART',
    filterCategory: 'typography pod',
    imageUrl: './portfolio/never-give-up-typography.png',
    liveUrl: 'https://www.behance.net/biplob-art',
    githubUrl: 'https://github.com',
    desc: 'Multi-layered geometric typography artwork with custom diagonal hatching, dual-tone orange/red gradient accents, and print-ready vector separations.',
    modalCategory: 'Custom Lettering & Vector Typography',
    techStack: ['Typography', 'Vector Art', 'DTG Ready', 'Color Separation'],
    isFeatured: true,
    views: 310
  },
  'p3': {
    id: 'p3',
    title: 'Splatter Peace Hand — Colorburst Apparel Art',
    category: 'Pop Art & Colorburst',
    categoryBadge: 'VECTOR ILLUSTRATION',
    filterCategory: 'illustration pod',
    imageUrl: './portfolio/peace-hand-vector-splatter.png',
    liveUrl: 'https://www.behance.net/biplob-art',
    githubUrl: 'https://github.com',
    desc: 'Dynamic multi-color victory hand illustration with explosive paint splatter effects, designed for high-resolution Direct-to-Garment (DTG) print on demand apparel.',
    modalCategory: 'Vector Illustration & Pop Art',
    techStack: ['Pop Art', 'Paint Splatter', 'High-Res DTG', 'Photoshop'],
    isFeatured: true,
    views: 290
  },
  'p4': {
    id: 'p4',
    title: '"Focus On The Goals" Cyber-Green Oversized Tee',
    category: 'Urban Minimalist Graphic',
    categoryBadge: 'CYBER STREETWEAR',
    filterCategory: 'streetwear typography',
    imageUrl: './portfolio/focus-on-goals-streetwear.png',
    liveUrl: 'https://www.behance.net/biplob-art',
    githubUrl: 'https://github.com',
    desc: 'High-contrast bold typographic streetwear design with electric neon green accents, symmetrical vertical alignment, and modern streetwear silhouette framing.',
    modalCategory: 'Urban Minimalist & Heavyweight Streetwear',
    techStack: ['Cyber Green', 'Bold Typography', 'Heavyweight Tee', 'Apparel Design'],
    isFeatured: false,
    views: 185
  },
  'p5': {
    id: 'p5',
    title: '"Next Level — One Level Up" Heavyweight Tee',
    category: 'Cyberpunk Techwear',
    categoryBadge: 'TECHWEAR EDITION',
    filterCategory: 'streetwear pod',
    imageUrl: './portfolio/next-level-cyber-tee.jpg',
    liveUrl: 'https://www.behance.net/biplob-art',
    githubUrl: 'https://github.com',
    desc: 'Technical cyber streetwear graphic featuring futuristic wireframe numbers, coordinate grids, and bold lime-neon typography crafted for modern apparel lines.',
    modalCategory: 'Cyberpunk Techwear Edition',
    techStack: ['Techwear', 'Lime Neon', 'Graphic Tee', 'Street Fashion'],
    isFeatured: false,
    views: 220
  },
  'p6': {
    id: 'p6',
    title: '"UNBEATEN // Brooklyn 1986" Streetwear Typography Tee',
    category: 'Streetwear & Denim Typography',
    categoryBadge: 'DENIM STREETWEAR',
    filterCategory: 'streetwear typography pod',
    imageUrl: './portfolio/unbeaten-brooklyn-denim.png',
    liveUrl: 'https://www.behance.net/biplob-art',
    githubUrl: 'https://github.com',
    desc: 'High-impact urban apparel concept featuring stacked amber-gold and white typography, horizontal speed shadow trails, and industrial label specs engineered for commercial apparel drops.',
    modalCategory: 'Streetwear Apparel & Denim Typography',
    techStack: ['Streetwear', 'Amber Gold', 'Brooklyn Denim', 'Screen Print'],
    isFeatured: true,
    views: 380
  },
  'p7': {
    id: 'p7',
    title: '"SAVAGE" Heavy Metal Gothic Lettering & Metalwear',
    category: 'Gothic Lettering & Metalwear',
    categoryBadge: 'GOTHIC METALWEAR',
    filterCategory: 'typography streetwear',
    imageUrl: './portfolio/savage-gothic-metal-typography.png',
    liveUrl: 'https://www.behance.net/biplob-art',
    githubUrl: 'https://github.com',
    desc: 'Aggressive blackletter typography crafted with sharp spiky thorn flourishes, chrome-metallic bevel shading, and distressed weathering tailored for underground rock & gothic merchandise.',
    modalCategory: 'Gothic Lettering & Darkwear Apparel',
    techStack: ['Gothic Metal', 'Spiked Lettering', 'Darkwear', 'Chrome Vector'],
    isFeatured: true,
    views: 450
  },
  'p8': {
    id: 'p8',
    title: '"NEVER LOOK BACK — Brooklyn NYC" Grunge Brush Typography',
    category: 'Urban Grunge & Brush Art',
    categoryBadge: 'URBAN GRUNGE',
    filterCategory: 'streetwear typography pod',
    imageUrl: './portfolio/never-look-back-grunge-apparel.png',
    liveUrl: 'https://www.behance.net/biplob-art',
    githubUrl: 'https://github.com',
    desc: 'Raw, dynamic calligraphic brush-stroke typography enclosed within a vivid neon crimson geometric bounding frame with distressed splatter textures for street culture apparel lines.',
    modalCategory: 'Urban Grunge & Brush Art Streetwear',
    techStack: ['Brush Typography', 'Neon Red Frame', 'Brooklyn NYC', 'DTG Ready'],
    isFeatured: false,
    views: 260
  },
  'p9': {
    id: 'p9',
    title: '"BREAK THE RULES // NYC Sport System" Techwear Graphic Tee',
    category: 'Cyber Techwear & Sports Apparel',
    categoryBadge: 'CYBER TECHWEAR',
    filterCategory: 'streetwear pod typography',
    imageUrl: './portfolio/break-the-rules-techwear.png',
    liveUrl: 'https://www.behance.net/biplob-art',
    githubUrl: 'https://github.com',
    desc: 'Modern cyber athletic techwear graphic combining bold vertical typography, segmented canary yellow accent blocks, diagonal coordinate grids, and technical sportswear specs.',
    modalCategory: 'Cyber Techwear & Sports Apparel',
    techStack: ['Techwear', 'Sport System', 'Yellow Accent', 'Apparel Design'],
    isFeatured: true,
    views: 340
  },
  'p10': {
    id: 'p10',
    title: '"BEACH PLEASE" Retro Tropical Sunglasses Vector Art',
    category: 'Vector Illustration & Summer Apparel',
    categoryBadge: 'SUMMER VECTOR ART',
    filterCategory: 'illustration pod',
    imageUrl: './portfolio/beach-please-summer-apparel.png',
    liveUrl: 'https://www.behance.net/biplob-art',
    githubUrl: 'https://github.com',
    desc: 'Vibrant summer resort apparel artwork featuring classic sunglasses reflecting a sun-drenched tropical ocean landscape, coastal palms, and golden sunset paired with playful script typography.',
    modalCategory: 'Vector Illustration & Summer Apparel',
    techStack: ['Summer Art', 'Tropical Sunset', 'Pop Illustration', 'Color Separation'],
    isFeatured: false,
    views: 215
  }
};

// Default Skills & Certifications Data
export const DEFAULT_SKILLS = [
  {
    id: 'sk_1',
    category: 'Creative Apparel & Print',
    name: 'Custom T-Shirt Graphic Design',
    proficiency: 98,
    iconName: 'shirt',
    levelText: 'Master Specialist'
  },
  {
    id: 'sk_2',
    category: 'Creative Apparel & Print',
    name: 'Vector Art & Adobe Illustrator',
    proficiency: 96,
    iconName: 'pen-tool',
    levelText: 'Expert'
  },
  {
    id: 'sk_3',
    category: 'Creative Apparel & Print',
    name: 'Custom Typography & Lettering',
    proficiency: 94,
    iconName: 'type',
    levelText: 'Advanced'
  },
  {
    id: 'sk_4',
    category: 'Creative Apparel & Print',
    name: 'Print on Demand (POD) & DTG',
    proficiency: 92,
    iconName: 'printer',
    levelText: 'Expert'
  },
  {
    id: 'sk_5',
    category: 'Industry & Production',
    name: 'Screen Print Color Separation',
    proficiency: 95,
    iconName: 'layers',
    levelText: 'Senior Lead'
  },
  {
    id: 'sk_6',
    category: 'Industry & Production',
    name: 'Apparel Tech Packs & Sizing Specs',
    proficiency: 90,
    iconName: 'file-text',
    levelText: 'Professional'
  },
  {
    id: 'sk_7',
    category: 'Software & Technology',
    name: 'Adobe Photoshop & Photo Manipulation',
    proficiency: 92,
    iconName: 'image',
    levelText: 'Expert'
  },
  {
    id: 'sk_8',
    category: 'Software & Technology',
    name: 'Canva & Rapid Visual Prototyping',
    proficiency: 88,
    iconName: 'layout',
    levelText: 'Proficient'
  }
];

export const DEFAULT_CERTIFICATIONS = [
  {
    id: 'cert_1',
    title: 'Advanced Vector Illustration & Apparel Masterclass',
    issuer: 'Professional Graphic Design Institute',
    year: '2024',
    badge: 'VERIFIED'
  },
  {
    id: 'cert_2',
    title: 'Screen Printing & Industrial Color Separation',
    issuer: 'Textile & Garment Academy',
    year: '2023',
    badge: 'TECHNICAL'
  },
  {
    id: 'cert_3',
    title: 'Print On Demand (POD) Brand Growth & Tech Pack System',
    issuer: 'Apparel Commerce Accelerator',
    year: '2025',
    badge: 'BUSINESS'
  }
];

// Default Global Site Settings
export const DEFAULT_SITE_SETTINGS = {
  heroHeadline: 'MD BIPLOB',
  heroSubHeadline: 'Custom T-Shirt Artist // Vector Designer // POD Specialist',
  heroBio: 'Specializing in custom t-shirt design — from cutting-edge streetwear concepts to simple, minimalist aesthetics. With years of real-world experience at Fabrilife and Street ThreadX, I turn creative ideas into wearable designs that stand out and sell.',
  aboutMeText: 'Senior Graphic & Apparel Designer with a proven track record creating commercially successful t-shirt collections for international brands, fashion streetwear drops, and Print-on-Demand businesses worldwide.',
  resumeLink: 'https://www.linkedin.com/in/biplob-art/',
  contactEmail: 'talukderbiplob498@gmail.com',
  whatsappNumber: '+8801340276600',
  telegramUser: '@biplob_art',
  behanceUrl: 'https://www.behance.net/biplob-art',
  linkedinUrl: 'https://www.linkedin.com/in/biplob-art/',
  announcementEnabled: true,
  announcementText: '🔥 NOW ACCEPTING NEW CUSTOM APPAREL & STREETWEAR COMMISSIONS FOR 2026 // FAST TURNAROUND',
  customAccent: '#00f3ff',
  particleCount: '12000'
};

/* ==========================================================================
   1. FIRESTORE REST API HELPERS
   ========================================================================== */

/**
 * Generic Firestore REST document fetcher
 */
async function fetchFirestoreCollection(collectionName) {
  if (!isFirebaseConfigured || !firebaseConfig.projectId) return null;
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${collectionName}?key=${firebaseConfig.apiKey}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return data.documents || [];
    }
  } catch (err) {
    console.warn(`Firestore read notice for [${collectionName}]:`, err.message);
  }
  return null;
}

/**
 * Generic Firestore REST document writer
 */
async function writeFirestoreDocument(collectionName, docId, fields) {
  if (!isFirebaseConfigured || !firebaseConfig.projectId) return null;
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${collectionName}/${docId}?key=${firebaseConfig.apiKey}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });
    if (response.ok) return await response.json();
  } catch (err) {
    console.warn(`Firestore write notice for [${collectionName}/${docId}]:`, err.message);
  }
  return null;
}

/* ==========================================================================
   2. PROJECTS COLLECTION
   ========================================================================== */
export function getStoredProjects() {
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.error('Error reading projects from storage', e);
  }
  return { ...DEFAULT_PROJECTS };
}

export function saveStoredProjects(projects) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('Error saving projects', e);
  }
}

export function recordProjectView(projectId) {
  const projects = getStoredProjects();
  if (projects[projectId]) {
    projects[projectId].views = (projects[projectId].views || 0) + 1;
    saveStoredProjects(projects);
  }
}

/* ==========================================================================
   3. SKILLS & CERTIFICATIONS COLLECTION
   ========================================================================== */
export function getStoredSkills() {
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.SKILLS);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.error('Error reading skills from storage', e);
  }
  return {
    skills: [...DEFAULT_SKILLS],
    certifications: [...DEFAULT_CERTIFICATIONS]
  };
}

export function saveStoredSkills(skillsData) {
  try {
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skillsData));
  } catch (e) {
    console.error('Error saving skills', e);
  }
}

/* ==========================================================================
   4. MESSAGES / INQUIRIES COLLECTION
   ========================================================================== */
export function getLocalInquiries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
  } catch (e) {
    return [];
  }
}

export function saveLocalInquiries(inquiries) {
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(inquiries.slice(0, 100)));
  } catch (e) {
    console.error(e);
  }
}

export async function saveUserInquiry(inquiryData) {
  const payload = {
    senderName: (inquiryData.name || 'Anonymous Client').trim(),
    name: (inquiryData.name || 'Anonymous Client').trim(),
    senderEmail: (inquiryData.email || '').trim(),
    email: (inquiryData.email || '').trim(),
    phone: (inquiryData.phone || '').trim(),
    projectType: inquiryData.projectType || 'Custom T-Shirt Design',
    quantity: inquiryData.quantity || '1-50 Units',
    message: (inquiryData.message || '').trim(),
    createdAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    status: 'new',
    isRead: false,
    source: '3d-portfolio-website'
  };

  const fallbackId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  
  // 1. Save to local storage cache
  const existing = getLocalInquiries();
  existing.unshift({ id: fallbackId, ...payload });
  saveLocalInquiries(existing);

  // 2. Cloud Firestore REST Sync
  if (isFirebaseConfigured && firebaseConfig.projectId) {
    const fields = {
      senderName: { stringValue: payload.senderName },
      senderEmail: { stringValue: payload.senderEmail },
      phone: { stringValue: payload.phone },
      projectType: { stringValue: payload.projectType },
      quantity: { stringValue: payload.quantity },
      message: { stringValue: payload.message },
      createdAt: { stringValue: payload.createdAt },
      status: { stringValue: payload.status },
      isRead: { booleanValue: payload.isRead }
    };
    writeFirestoreDocument('messages', fallbackId, fields);
  }

  return {
    success: true,
    id: fallbackId,
    mode: isFirebaseConfigured ? 'cloud' : 'local',
    message: 'Inquiry saved successfully to portfolio CRM database!'
  };
}

/* ==========================================================================
   5. SITE SETTINGS COLLECTION
   ========================================================================== */
export function getStoredSiteSettings() {
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (cached) return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(cached) };
  } catch (e) {
    console.error(e);
  }
  return { ...DEFAULT_SITE_SETTINGS };
}

export function saveStoredSiteSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error(e);
  }
}

/* ==========================================================================
   6. ANALYTICS
   ========================================================================== */
export function getAnalyticsData() {
  const projects = getStoredProjects();
  const inquiries = getLocalInquiries();
  
  const totalViews = Object.values(projects).reduce((acc, p) => acc + (p.views || 0), 0);
  const unreadMessages = inquiries.filter(m => !m.isRead && m.status === 'new').length;
  const totalProjects = Object.keys(projects).length;
  const activeDeals = inquiries.filter(m => m.status === 'discussion' || m.status === 'quoted').length;

  return {
    totalViews,
    unreadMessages,
    totalProjects,
    totalInquiries: inquiries.length,
    activeDeals
  };
}
