import { sound } from '../audio/soundFx.js';
import confetti from 'canvas-confetti';
import { createIcons, icons } from 'lucide';

export class HudController {
  constructor(sceneManager, coreGeometry, particleGalaxy, warpEffect) {
    this.sceneManager = sceneManager;
    this.coreGeometry = coreGeometry;
    this.particleGalaxy = particleGalaxy;
    this.warpEffect = warpEffect;

    this.fpsElem = document.getElementById('hud-fps');
    this.camElem = document.getElementById('hud-cam');
    this.mouseElem = document.getElementById('hud-mouse');

    this.frameCount = 0;
    this.lastTime = performance.now();

    this.initAudioToggle();
    this.initThemeSelector();
    this.initSandboxControls();
    this.initWarpTrigger();
    this.initSoundHoverEffects();
  }

  initAudioToggle() {
    const audioBtn = document.getElementById('audio-toggle-btn');
    if (!audioBtn) return;

    audioBtn.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      audioBtn.innerHTML = isMuted
        ? `<i data-lucide="volume-x"></i>`
        : `<i data-lucide="volume-2"></i>`;
      createIcons({ icons });
    });
  }

  initThemeSelector() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    const themePanel = document.getElementById('theme-panel');
    const paletteButtons = document.querySelectorAll('.theme-btn');

    if (themeBtn && themePanel) {
      themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themePanel.classList.toggle('open');
        sound.playClick();
      });

      document.addEventListener('click', (e) => {
        if (!themePanel.contains(e.target) && e.target !== themeBtn) {
          themePanel.classList.remove('open');
        }
      });
    }

    const themes = {
      'cyber-neon': { primary: '#00f3ff', secondary: '#ff007f' },
      'deep-space': { primary: '#3b82f6', secondary: '#8b5cf6' },
      'emerald-matrix': { primary: '#00ff88', secondary: '#00d2ff' },
      'solar-flare': { primary: '#ffaa00', secondary: '#ff3366' }
    };

    paletteButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme-val');
        document.documentElement.setAttribute('data-theme', theme);

        paletteButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (themes[theme]) {
          this.sceneManager.setThemeColors(themes[theme].primary, themes[theme].secondary);
        }

        sound.playChime();
        if (themePanel) themePanel.classList.remove('open');
      });
    });
  }

  initSandboxControls() {
    // Shape selectors
    const shapeButtons = document.querySelectorAll('[data-shape]');
    shapeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        shapeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const shape = btn.getAttribute('data-shape');
        this.coreGeometry.setShape(shape);
        sound.playChime();
      });
    });

    // Texture Decal selectors
    const texButtons = document.querySelectorAll('[data-tex]');
    texButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        texButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tex = btn.getAttribute('data-tex');
        this.coreGeometry.setTextureMode(tex);
        sound.playClick();
      });
    });

    // Material selectors
    const matButtons = document.querySelectorAll('[data-mat]');
    matButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        matButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mat = btn.getAttribute('data-mat');
        this.coreGeometry.setMaterialMode(mat);
        sound.playClick();
      });
    });

    // Explode / Deconstruct Geometry Toggle
    const explodeBtn = document.getElementById('explode-btn');
    if (explodeBtn) {
      explodeBtn.addEventListener('click', () => {
        const isExploded = this.coreGeometry.toggleExplode();
        explodeBtn.classList.toggle('active', isExploded);
        explodeBtn.innerHTML = isExploded
          ? `<i data-lucide="minimize-2" style="width: 14px; height: 14px;"></i> Assemble 3D Mesh`
          : `<i data-lucide="maximize-2" style="width: 14px; height: 14px;"></i> Deconstruct / Explode`;
        createIcons({ icons });
        sound.playChime();
      });
    }

    // Rotation Speed Slider
    const speedSlider = document.getElementById('speed-slider');
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        this.coreGeometry.setSpeed(e.target.value);
      });
    }

    // Particle Density Slider
    const particleSlider = document.getElementById('particle-slider');
    if (particleSlider) {
      particleSlider.addEventListener('change', (e) => {
        this.particleGalaxy.setCount(e.target.value);
        const countElem = document.getElementById('hud-particles');
        if (countElem) countElem.innerText = `${e.target.value} PTS`;
        sound.playClick();
      });
    }
  }

  initWarpTrigger() {
    const warpButtons = document.querySelectorAll('.trigger-warp-btn');
    warpButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playWarpJump();
        this.warpEffect.triggerWarp(() => {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#00f3ff', '#ff007f', '#ffffff']
          });
        });
      });
    });
  }

  initSoundHoverEffects() {
    const interactiveElements = document.querySelectorAll('button, .cyber-btn, .nav-link, .project-card, .feature-card, .pill-btn');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        sound.playHover();
      });
      el.addEventListener('click', () => {
        sound.playClick();
      });
    });
  }

  update() {
    this.frameCount++;
    const now = performance.now();

    // Calculate FPS every 500ms
    if (now - this.lastTime >= 500) {
      const fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
      if (this.fpsElem) {
        this.fpsElem.innerText = `${fps} FPS`;
      }
      this.frameCount = 0;
      this.lastTime = now;
    }

    // Update Camera position in HUD
    if (this.camElem && this.sceneManager.camera) {
      const c = this.sceneManager.camera.position;
      this.camElem.innerText = `X:${c.x.toFixed(1)} Y:${c.y.toFixed(1)} Z:${c.z.toFixed(1)}`;
    }

    // Update Mouse coords in HUD
    if (this.mouseElem) {
      const m = this.sceneManager.mouse;
      this.mouseElem.innerText = `X:${m.targetX.toFixed(2)} Y:${m.targetY.toFixed(2)}`;
    }
  }
}
