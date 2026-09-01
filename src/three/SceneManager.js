import * as THREE from 'three';

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Core Three.js components
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 0, 15);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    this.container.appendChild(this.renderer.domElement);

    // Mouse tracking for parallax
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0, rawX: 0, rawY: 0 };
    this.clock = new THREE.Clock();

    // Scene modules container
    this.updatables = [];

    // Lighting setup
    this.setupLights();
    this.setupEvents();
  }

  setupLights() {
    // Ambient light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.ambientLight);

    // Primary Neon Point Light
    this.primaryLight = new THREE.PointLight(0x00f3ff, 80, 50);
    this.primaryLight.position.set(5, 5, 8);
    this.scene.add(this.primaryLight);

    // Secondary Accent Point Light
    this.secondaryLight = new THREE.PointLight(0xff007f, 60, 50);
    this.secondaryLight.position.set(-5, -5, 6);
    this.scene.add(this.secondaryLight);

    // Rim Directional Light
    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    this.dirLight.position.set(0, 10, 10);
    this.scene.add(this.dirLight);
  }

  setThemeColors(primaryHex, secondaryHex) {
    const pColor = new THREE.Color(primaryHex);
    const sColor = new THREE.Color(secondaryHex);

    this.primaryLight.color.copy(pColor);
    this.secondaryLight.color.copy(sColor);

    this.updatables.forEach(obj => {
      if (obj.onThemeChange) {
        obj.onThemeChange(pColor, sColor);
      }
    });
  }

  setupEvents() {
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: true });
    window.addEventListener('touchstart', this.onTouchMove.bind(this), { passive: true });
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  onMouseMove(e) {
    this.mouse.rawX = e.clientX;
    this.mouse.rawY = e.clientY;
    // Normalized coordinates (-1 to 1)
    this.mouse.targetX = (e.clientX / this.width) * 2 - 1;
    this.mouse.targetY = -(e.clientY / this.height) * 2 + 1;
  }

  onTouchMove(e) {
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      this.mouse.rawX = touch.clientX;
      this.mouse.rawY = touch.clientY;
      this.mouse.targetX = (touch.clientX / this.width) * 2 - 1;
      this.mouse.targetY = -(touch.clientY / this.height) * 2 + 1;
    }
  }

  addUpdatable(obj) {
    this.updatables.push(obj);
  }

  render() {
    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Smooth mouse lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Dynamic light pulsing
    if (this.primaryLight) {
      this.primaryLight.position.x = Math.sin(elapsedTime * 0.8) * 6;
      this.primaryLight.position.y = Math.cos(elapsedTime * 0.6) * 5;
    }

    // Update all registered modules
    for (let i = 0; i < this.updatables.length; i++) {
      this.updatables[i].update(elapsedTime, delta, this.mouse);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
