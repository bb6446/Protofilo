import { createIcons, icons } from 'lucide';
import { SceneManager } from './three/SceneManager.js';
import { CoreGeometry } from './three/CoreGeometry.js';
import { ParticleGalaxy } from './three/ParticleGalaxy.js';
import { FloatingNodes } from './three/FloatingNodes.js';
import { WarpEffect } from './three/WarpEffect.js';
import { ScrollController } from './animations/scrollController.js';
import { HudController } from './ui/hudController.js';
import { ModalController } from './ui/modalController.js';
import { ContactController } from './ui/contactController.js';
import { AdminController } from './ui/adminController.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  createIcons({ icons });

  // 2. Set up WebGL 3D Scene
  const container = document.getElementById('webgl-container');
  const sceneManager = new SceneManager(container);

  // 3. Add 3D Scene Modules
  const coreGeometry = new CoreGeometry(sceneManager.scene);
  const particleGalaxy = new ParticleGalaxy(sceneManager.scene, 12000);
  const floatingNodes = new FloatingNodes(sceneManager.scene, sceneManager.camera);
  const warpEffect = new WarpEffect(sceneManager.scene, sceneManager.camera);

  sceneManager.addUpdatable(coreGeometry);
  sceneManager.addUpdatable(particleGalaxy);
  sceneManager.addUpdatable(floatingNodes);
  sceneManager.addUpdatable(warpEffect);

  // 4. Initialize GSAP Scroll Camera Choreography
  const scrollController = new ScrollController(sceneManager, coreGeometry);

  // 5. Initialize UI, Telemetry, Admin & Form Controllers
  const hudController = new HudController(sceneManager, coreGeometry, particleGalaxy, warpEffect);
  const modalController = new ModalController();
  const contactController = new ContactController();
  const adminController = new AdminController(modalController, sceneManager);

  // Mobile Navigation Drawer Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinksList = document.querySelector('.nav-links');
  if (mobileMenuBtn && navLinksList) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinksList.classList.toggle('mobile-open');
    });

    navLinksList.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinksList.classList.remove('mobile-open');
      });
    });
  }

  // 6. Master Animation Render Loop
  function animate() {
    requestAnimationFrame(animate);
    sceneManager.render();
    hudController.update();
  }

  animate();
  console.log('🚀 AETHERIA 3D // WebGL Engine & Firebase Services Initialized');
});
