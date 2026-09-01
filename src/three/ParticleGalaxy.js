import * as THREE from 'three';

export class ParticleGalaxy {
  constructor(scene, count = 12000) {
    this.scene = scene;
    this.count = count;

    this.primaryColor = new THREE.Color(0x00f3ff);
    this.secondaryColor = new THREE.Color(0xff007f);

    this.initParticles();
  }

  initParticles() {
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);
    const initialPositions = new Float32Array(this.count * 3);
    const scales = new Float32Array(this.count);

    const radius = 45;

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;

      // Spherical distribution with spiral density
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = Math.cbrt(Math.random()) * radius;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      initialPositions[i3] = x;
      initialPositions[i3 + 1] = y;
      initialPositions[i3 + 2] = z;

      // Dynamic color interpolation between primary & secondary
      const mixRatio = Math.random();
      const mixedColor = this.primaryColor.clone().lerp(this.secondaryColor, mixRatio);

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      scales[i] = Math.random() * 2.5 + 0.8;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
    this.initialPositions = initialPositions;

    // Custom Canvas Texture for glowing circular particles
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(0, 243, 255, 0.8)');
    grad.addColorStop(0.7, 'rgba(0, 243, 255, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const particleTexture = new THREE.CanvasTexture(canvas);

    this.material = new THREE.PointsMaterial({
      size: 0.85,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);
  }

  setCount(newCount) {
    this.scene.remove(this.points);
    this.geometry.dispose();
    this.count = parseInt(newCount);
    this.initParticles();
  }

  onThemeChange(primary, secondary) {
    this.primaryColor.copy(primary);
    this.secondaryColor.copy(secondary);

    const colors = this.geometry.attributes.color.array;
    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      const mixRatio = Math.random();
      const mixedColor = this.primaryColor.clone().lerp(this.secondaryColor, mixRatio);
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }
    this.geometry.attributes.color.needsUpdate = true;
  }

  update(time, delta, mouse) {
    if (!this.points) return;

    // Slow cosmic galaxy spin
    this.points.rotation.y = time * 0.05;
    this.points.rotation.x = time * 0.02;

    const positions = this.geometry.attributes.position.array;
    const initial = this.initialPositions;

    // Interactive mouse repulsion wave
    const mouseWorldX = mouse.x * 20;
    const mouseWorldY = mouse.y * 20;

    for (let i = 0; i < this.count; i += 2) { // process every 2nd for 60fps performance
      const i3 = i * 3;

      // Small natural wave oscillation
      positions[i3] = initial[i3] + Math.sin(time * 1.5 + initial[i3 + 1] * 0.1) * 0.4;
      positions[i3 + 1] = initial[i3 + 1] + Math.cos(time * 1.2 + initial[i3] * 0.1) * 0.4;
      positions[i3 + 2] = initial[i3 + 2] + Math.sin(time * 1.0 + initial[i3 + 2] * 0.1) * 0.4;

      // Repulsion from mouse vector
      const dx = positions[i3] - mouseWorldX;
      const dy = positions[i3 + 1] - mouseWorldY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 8) {
        const force = (8 - dist) / 8;
        positions[i3] += (dx / (dist + 0.001)) * force * 1.2;
        positions[i3 + 1] += (dy / (dist + 0.001)) * force * 1.2;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
  }
}
