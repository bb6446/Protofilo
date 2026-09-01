import * as THREE from 'three';
import gsap from 'gsap';

export class WarpEffect {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.streakCount = 1500;
    this.isWarping = false;
    this.warpSpeed = 0.05;

    this.initStreaks();
  }

  initStreaks() {
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.streakCount * 6);
    const colors = new Float32Array(this.streakCount * 6);

    for (let i = 0; i < this.streakCount; i++) {
      const i6 = i * 6;
      const x = (Math.random() - 0.5) * 80;
      const y = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 150;

      // Start point of streak
      positions[i6] = x;
      positions[i6 + 1] = y;
      positions[i6 + 2] = z;

      // End point of streak
      positions[i6 + 3] = x;
      positions[i6 + 4] = y;
      positions[i6 + 5] = z - 2;

      // Cyan to white streak
      colors[i6] = 0.0;
      colors[i6 + 1] = 0.95;
      colors[i6 + 2] = 1.0;

      colors[i6 + 3] = 1.0;
      colors[i6 + 4] = 1.0;
      colors[i6 + 5] = 1.0;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      linewidth: 2
    });

    this.lines = new THREE.LineSegments(this.geometry, this.material);
    this.scene.add(this.lines);
  }

  triggerWarp(onComplete) {
    if (this.isWarping) return;
    this.isWarping = true;

    // Fade in streaks and accelerate
    gsap.to(this.material, { opacity: 0.9, duration: 0.6 });
    gsap.to(this, {
      warpSpeed: 3.5,
      duration: 1.5,
      ease: 'power3.in',
      onComplete: () => {
        // Flash / Shockwave finish
        gsap.to(this.material, {
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => {
            this.isWarping = false;
            this.warpSpeed = 0.05;
            if (onComplete) onComplete();
          }
        });
      }
    });

    // Camera FOV zoom effect
    gsap.to(this.camera, {
      fov: 95,
      duration: 1.2,
      ease: 'power2.in',
      onUpdate: () => this.camera.updateProjectionMatrix(),
      onComplete: () => {
        gsap.to(this.camera, {
          fov: 60,
          duration: 0.8,
          ease: 'elastic.out(1, 0.4)',
          onUpdate: () => this.camera.updateProjectionMatrix()
        });
      }
    });
  }

  update(time, delta) {
    if (!this.lines || this.material.opacity <= 0.01) return;

    const pos = this.geometry.attributes.position.array;

    for (let i = 0; i < this.streakCount; i++) {
      const i6 = i * 6;
      pos[i6 + 2] += this.warpSpeed * 12;
      pos[i6 + 5] = pos[i6 + 2] - (this.warpSpeed * 8);

      if (pos[i6 + 2] > 20) {
        pos[i6 + 2] = -120;
        pos[i6 + 5] = -120;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
  }
}
