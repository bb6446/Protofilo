import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class ScrollController {
  constructor(sceneManager, coreGeometry) {
    this.sceneManager = sceneManager;
    this.camera = sceneManager.camera;
    this.coreGeometry = coreGeometry;

    this.initScrollAnimations();
    this.initNavbarHighlight();
  }

  initScrollAnimations() {
    const cam = this.camera;
    const coreMesh = this.coreGeometry.group;

    // Timeline for full scroll choreography
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2
      }
    });

    // 1. Hero -> Sandbox transition
    tl.to(cam.position, {
      x: -4.5,
      y: 0,
      z: 11,
      ease: 'power1.inOut'
    }, 'step1')
    .to(coreMesh.position, {
      x: -3.5,
      y: 0,
      z: 0,
      ease: 'power1.inOut'
    }, 'step1')
    .to(coreMesh.scale, {
      x: 1.15,
      y: 1.15,
      z: 1.15,
      ease: 'power1.inOut'
    }, 'step1');

    // 2. Sandbox -> Features transition
    tl.to(cam.position, {
      x: 3.5,
      y: -3,
      z: 16,
      ease: 'power1.inOut'
    }, 'step2')
    .to(coreMesh.position, {
      x: 4.0,
      y: -1.5,
      z: -2,
      ease: 'power1.inOut'
    }, 'step2')
    .to(coreMesh.scale, {
      x: 0.9,
      y: 0.9,
      z: 0.9,
      ease: 'power1.inOut'
    }, 'step2');

    // 3. Features -> Projects transition
    tl.to(cam.position, {
      x: 0,
      y: -6,
      z: 19,
      ease: 'power1.inOut'
    }, 'step3')
    .to(coreMesh.position, {
      x: 0,
      y: -4,
      z: -4,
      ease: 'power1.inOut'
    }, 'step3')
    .to(coreMesh.scale, {
      x: 0.75,
      y: 0.75,
      z: 0.75,
      ease: 'power1.inOut'
    }, 'step3');

    // 4. Projects -> Warp Section transition
    tl.to(cam.position, {
      x: 0,
      y: 0,
      z: 14,
      ease: 'power1.inOut'
    }, 'step4')
    .to(coreMesh.position, {
      x: 0,
      y: 0,
      z: 0,
      ease: 'power1.inOut'
    }, 'step4')
    .to(coreMesh.scale, {
      x: 1.3,
      y: 1.3,
      z: 1.3,
      ease: 'power1.inOut'
    }, 'step4');

    // Fade-in animations for section titles and cards
    gsap.utils.toArray('.reveal-card').forEach(el => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
      });
    });
  }

  initNavbarHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
      let current = '';
      const scrollPos = window.scrollY + 200;

      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    });
  }
}
