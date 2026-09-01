import { sound } from '../audio/soundFx.js';

export class ModalController {
  constructor() {
    this.modal = document.getElementById('project-modal');
    this.titleElem = document.getElementById('modal-title');
    this.categoryElem = document.getElementById('modal-category');
    this.descElem = document.getElementById('modal-desc');
    this.tagsElem = document.getElementById('modal-tags');
    this.imgElem = document.getElementById('modal-img');
    this.closeBtn = document.getElementById('modal-close-btn');

    this.projectData = {
      'p1': {
        title: 'Street ThreadX — Urban Streetwear Lineup',
        category: 'Streetwear Apparel Campaign (Street ThreadX)',
        image: './portfolio/street-threadx-collection.png',
        desc: 'A cutting-edge oversized streetwear apparel collection created for Street ThreadX. Featuring bold cybernetic typography including "FOCUS ON THE GOALS", "UNSTOPPABLE", "explore", "STRONGER", and "NEXT LEVEL". Mastered for oversized streetwear fits, premium heavyweight cotton, and multi-color screen printing.',
        tags: ['Streetwear Concept', 'Adobe Illustrator', 'Screen Print', 'Tech Pack', 'Oversized Silhouette', 'Color Separations']
      },
      'p2': {
        title: '"Never Give Up — Created Your Own Future" Tee',
        category: 'Custom Lettering & Vector Typography',
        image: './portfolio/never-give-up-typography.png',
        desc: 'A multi-layered modern vector typography piece crafted with custom angled line-hatching, dual-color gradient contrast (Sunset Orange & Crimson Red), and sharp geometric typography. Fully prepared in high-resolution vector format for direct-to-garment (DTG) and screen printing.',
        tags: ['Typography Design', 'Vector Illustration', 'DTG Print Ready', 'Adobe Illustrator', 'Gradient Separation', 'POD Standard']
      },
      'p3': {
        title: 'Splatter Peace Hand — Colorburst Apparel Art',
        category: 'Vector Illustration & Pop Art',
        image: './portfolio/peace-hand-vector-splatter.png',
        desc: 'An expressive, high-energy pop-art victory hand illustration bursting with multi-color paint splatter and vibrant CMYK gradients. Created with meticulous attention to line detail and color vibrance on dark apparel fabrics.',
        tags: ['Pop Art Vector', 'Paint Splatter', 'High-Res DTG', 'Adobe Photoshop', 'Illustrator', 'Merchandise Art']
      },
      'p4': {
        title: '"Focus On The Goals" Cyber-Green Oversized Tee',
        category: 'Urban Minimalist & Heavyweight Streetwear',
        image: './portfolio/focus-on-goals-streetwear.png',
        desc: 'A standout urban streetwear piece highlighting high-visibility neon cyber-green accents, clean central alignment, and bold typographic hierarchy. Designed specifically for oversized boxy-cut tees and modern streetwear brands.',
        tags: ['Cyber Green', 'Streetwear Fit', 'Bold Typography', 'Apparel Design', 'Fabrilife Style', 'DTG & Screen Print']
      },
      'p5': {
        title: '"Next Level — One Level Up" Heavyweight Tee',
        category: 'Cyberpunk Techwear Edition',
        image: './portfolio/next-level-cyber-tee.jpg',
        desc: 'A technical futuristic streetwear graphic with subtle background wireframe coordinate grids, "01 Level Up" typography, and sharp lime-neon accents. Engineered for contemporary techwear and urban apparel labels.',
        tags: ['Techwear Graphic', 'Lime Neon', 'Coordinate Grid', 'Modern Streetwear', 'Adobe Illustrator', 'Print Ready']
      },
      'p6': {
        title: '"UNBEATEN // Brooklyn 1986" Streetwear Typography Tee',
        category: 'Streetwear Apparel & Denim Typography',
        image: './portfolio/unbeaten-brooklyn-denim.png',
        desc: 'Urban streetwear apparel concept featuring bold amber-gold and crisp white stacked typography ("UNBEATEN - SUPERIOR DENIM BROOKLYN 1986 // USA CORE DNM COMPANY") accompanied by horizontal speed-fade trails, technical barcode-style hatching, and industrial apparel labeling. Engineered for oversized streetwear fits and high-grade screen printing.',
        tags: ['Streetwear Graphic', 'Amber Gold', 'Brooklyn Denim', 'Bold Typography', 'Apparel Design', 'Screen Print Ready']
      },
      'p7': {
        title: '"SAVAGE" Heavy Metal Gothic Lettering & Metalwear',
        category: 'Gothic Lettering & Darkwear Apparel',
        image: './portfolio/savage-gothic-metal-typography.png',
        desc: 'Aggressive heavy-metal blackletter custom typography crafted with sharp spiky thorn flourishes, chrome-metallic bevel shading, distressed stone-texture weathering, and razor-edge symmetry. Tailored for gothic streetwear, rock merchandise, and high-impact underground apparel collections.',
        tags: ['Gothic Lettering', 'Heavy Metal Art', 'Distressed Chrome', 'Spiked Typography', 'Darkwear', 'Merchandise Art']
      },
      'p8': {
        title: '"NEVER LOOK BACK — Brooklyn NYC" Grunge Brush Typography',
        category: 'Urban Grunge & Brush Art Streetwear',
        image: './portfolio/never-look-back-grunge-apparel.png',
        desc: 'High-energy urban grunge t-shirt design featuring raw, textured calligraphic brush strokes enclosed in a contrasting neon crimson geometric bounding frame ("BROOKLYN NEW YORK CITY // NEVER LOOK BACK"). Combines authentic street culture attitude with distressed splatter textures for screen and DTG print execution.',
        tags: ['Brush Typography', 'Neon Red Frame', 'Urban Streetwear', 'Splatter Texture', 'DTG Ready', 'Adobe Photoshop']
      },
      'p9': {
        title: '"BREAK THE RULES // NYC Sport System" Techwear Graphic Tee',
        category: 'Cyber Techwear & Sports Apparel',
        image: './portfolio/break-the-rules-techwear.png',
        desc: 'Cutting-edge cyber athletic techwear graphic combining bold vertical typography, segmented canary yellow accent blocks, diagonal coordinate grids, and modern technical sportswear specifications ("MOVING FORWARD // THE NEXT GENERATIONS // NYC SPORT APP SYS"). Engineered for forward-thinking urban fashion drops.',
        tags: ['Cyber Techwear', 'Sportswear Art', 'Split Layout', 'Halftone Grids', 'Technical Graphic', 'POD Lineup']
      },
      'p10': {
        title: '"BEACH PLEASE" Retro Tropical Sunglasses Vector Art',
        category: 'Vector Illustration & Summer Apparel',
        image: './portfolio/beach-please-summer-apparel.png',
        desc: 'Vibrant retro summer vacation t-shirt illustration featuring classic black wayfarer sunglasses reflecting a picturesque tropical paradise — glowing golden sunset, lush green coastal islands, gentle ocean waves, and sandy shores — crowned with playful cursive lettering ("Beach PLEASE"). Optimized for bright apparel and summer resort merchandise.',
        tags: ['Vector Illustration', 'Summer Apparel', 'Tropical Sunset', 'Pop Art', 'Sunglasses Reflection', 'Adobe Illustrator']
      }
    };

    this.initEvents();
    this.initFilterTabs();
  }

  initEvents() {
    if (!this.modal) return;

    // Open on project card click
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-project-id');
        this.open(id);
      });
    });

    // Close button
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // Backdrop click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    // ESC key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.close();
      }
    });
  }

  initFilterTabs() {
    const tabs = document.querySelectorAll('.filter-tab-btn');
    const cards = document.querySelectorAll('.project-card');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.getAttribute('data-filter');
        sound.playClick();

        cards.forEach(card => {
          const category = card.getAttribute('data-category') || '';
          if (filter === 'all' || category.includes(filter)) {
            card.style.display = 'flex';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  open(projectId) {
    const data = this.projectData[projectId] || this.projectData['p1'];

    if (this.titleElem) this.titleElem.innerText = data.title;
    if (this.categoryElem) this.categoryElem.innerText = data.category;
    if (this.descElem) this.descElem.innerText = data.desc;
    if (this.imgElem) {
      this.imgElem.src = data.image;
      this.imgElem.alt = data.title;
    }

    if (this.tagsElem) {
      this.tagsElem.innerHTML = data.tags
        .map(t => `<span class="project-tag">${t}</span>`)
        .join('');
    }

    this.modal.classList.add('active');
    sound.playChime();
  }

  close() {
    this.modal.classList.remove('active');
    sound.playClick();
  }
}
