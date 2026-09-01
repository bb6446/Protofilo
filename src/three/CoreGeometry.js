import * as THREE from 'three';
import gsap from 'gsap';

export class CoreGeometry {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.currentShapeType = 'tshirt';
    this.materialMode = 'hologram';
    this.currentTexture = 'street';
    this.rotationSpeed = 1.0;
    this.isExploded = false;
    this.isDragging = false;
    this.prevMousePos = { x: 0, y: 0 };
    this.dragVelocity = { x: 0, y: 0 };

    this.primaryColor = new THREE.Color(0x00f3ff);
    this.secondaryColor = new THREE.Color(0xff007f);

    this.initGeometries();
    this.initTextures();
    this.createMaterials();

    // Main 3D Mesh
    this.mesh = new THREE.Mesh(this.geometries.tshirt, this.mainMaterial);
    this.group.add(this.mesh);

    // Outer Cyber Wireframe Shell
    this.wireframeMesh = new THREE.Mesh(this.geometries.tshirt, this.wireMaterial);
    this.wireframeMesh.scale.set(1.03, 1.03, 1.03);
    this.group.add(this.wireframeMesh);

    // Inner Glowing Core
    const innerGeo = new THREE.IcosahedronGeometry(1.6, 1);
    this.innerCoreMat = new THREE.MeshBasicMaterial({
      color: this.primaryColor,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    this.innerCore = new THREE.Mesh(innerGeo, this.innerCoreMat);
    this.group.add(this.innerCore);

    // Orbiting particle rings & satellites
    this.createOrbitRings();
    this.createSatellites();
    this.initDragControls();
  }

  initGeometries() {
    // 1. Procedural 3D Streetwear T-Shirt / Apparel Jersey
    const tshirtGroup = this.createTShirtGeometry();

    // 2. Cyber Streetwear Torus Knot
    const torusGeo = new THREE.TorusKnotGeometry(2.4, 0.65, 180, 32, 2, 5);

    // 3. Cyber Gem / Octahedron Diamond
    const diamondGeo = new THREE.OctahedronGeometry(3.2, 0);

    // 4. Hexagonal Streetwear Emblem / Shield Badge
    const badgeGeo = new THREE.CylinderGeometry(3.0, 3.2, 0.8, 6, 1);

    // 5. DNA Textile Yarn Double Helix
    const helixGeo = this.createHelixGeometry();

    // 6. Quantum Lattice Sphere
    const quantumGeo = new THREE.DodecahedronGeometry(3.0, 1);

    this.geometries = {
      tshirt: tshirtGroup,
      torus: torusGeo,
      diamond: diamondGeo,
      badge: badgeGeo,
      helix: helixGeo,
      quantum: quantumGeo
    };
  }

  createTShirtGeometry() {
    // Construct a composite procedural 3D boxy streetwear tee
    const torsoGeo = new THREE.BoxGeometry(3.4, 4.4, 1.2, 16, 16, 8);
    
    // Deform vertices for realistic garment drape & shoulder curve
    const pos = torsoGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Collar cutout curve at top center
      if (y > 1.4 && Math.abs(x) < 1.0) {
        y -= Math.cos((x / 1.0) * (Math.PI / 2)) * 0.45;
        pos.setY(i, y);
      }
      // Natural torso waist taper & fabric curvature
      if (y < 0) {
        z += Math.sin(y * 1.5) * 0.12;
        pos.setZ(i, z);
      }
    }
    torsoGeo.computeVertexNormals();
    return torsoGeo;
  }

  createHelixGeometry() {
    const curvePoints = [];
    for (let i = 0; i < 80; i++) {
      const t = (i / 80) * Math.PI * 4;
      const x = Math.sin(t) * 2.2;
      const y = (i / 80) * 6 - 3;
      const z = Math.cos(t) * 2.2;
      curvePoints.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    return new THREE.TubeGeometry(curve, 80, 0.45, 12, false);
  }

  initTextures() {
    this.textures = {
      street: this.generateCanvasTexture('STREET THREADX', 'OVERSIZED // TECHWEAR 01', '#00f3ff', '#ff007f'),
      goals: this.generateCanvasTexture('FOCUS ON THE GOALS', 'CYBER-GREEN // APPAREL', '#00ff88', '#00d2ff'),
      future: this.generateCanvasTexture('NEVER GIVE UP', 'CREATED YOUR OWN FUTURE', '#ffaa00', '#ff3366'),
      clean: null
    };
  }

  generateCanvasTexture(mainText, subText, color1, color2) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Background gradient & tech grid
    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
    grad.addColorStop(0, '#060a16');
    grad.addColorStop(1, '#0e162e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Neon Grid Pattern
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.15)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 1024; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0); ctx.lineTo(i, 1024);
      ctx.moveTo(0, i); ctx.lineTo(1024, i);
      ctx.stroke();
    }

    // Outer Neon Border
    ctx.strokeStyle = color1;
    ctx.lineWidth = 12;
    ctx.strokeRect(60, 60, 904, 904);

    // Barcode Graphic Header
    ctx.fillStyle = color1;
    for (let b = 100; b < 400; b += 16) {
      const w = (b % 32 === 0) ? 8 : 4;
      ctx.fillRect(b, 120, w, 40);
    }

    // Main Typographic Print
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 68px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(mainText, 512, 480);

    // Accent Tagline
    ctx.fillStyle = color2;
    ctx.font = '700 36px "JetBrains Mono", monospace';
    ctx.fillText(subText, 512, 570);

    // Lower Badge
    ctx.fillStyle = color1;
    ctx.fillRect(260, 650, 504, 12);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '600 24px "JetBrains Mono", monospace';
    ctx.fillText('DESIGNED BY MD BIPLOB // FABRILIFE & STREET THREADX', 512, 730);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  createMaterials() {
    // Glassmorphic / Holographic Mesh Material with texture support
    this.mainMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x112244,
      map: this.textures.street,
      emissive: this.primaryColor,
      emissiveIntensity: 0.35,
      roughness: 0.15,
      metalness: 0.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transmission: 0.5,
      opacity: 0.9,
      transparent: true,
      wireframe: false
    });

    // Outer cyber wireframe
    this.wireMaterial = new THREE.MeshBasicMaterial({
      color: this.primaryColor,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
  }

  createOrbitRings() {
    this.orbitGroup = new THREE.Group();

    const ringGeo1 = new THREE.TorusGeometry(4.4, 0.025, 16, 120);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: this.secondaryColor,
      transparent: true,
      opacity: 0.6
    });
    this.ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    this.ring1.rotation.x = Math.PI / 3;

    const ringGeo2 = new THREE.TorusGeometry(5.0, 0.025, 16, 120);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: this.primaryColor,
      transparent: true,
      opacity: 0.5
    });
    this.ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    this.ring2.rotation.y = Math.PI / 4;

    this.orbitGroup.add(this.ring1);
    this.orbitGroup.add(this.ring2);
    this.group.add(this.orbitGroup);
  }

  createSatellites() {
    this.satellites = new THREE.Group();
    const satGeo = new THREE.OctahedronGeometry(0.25, 0);

    for (let i = 0; i < 6; i++) {
      const satMat = new THREE.MeshBasicMaterial({
        color: (i % 2 === 0) ? this.primaryColor : this.secondaryColor
      });
      const sat = new THREE.Mesh(satGeo, satMat);
      const angle = (i / 6) * Math.PI * 2;
      sat.position.set(Math.cos(angle) * 4.4, Math.sin(angle) * 2.2, Math.sin(angle) * 4.4);
      sat.userData = { angle, speed: 0.8 + Math.random() * 0.4, dist: 4.4 + Math.random() * 0.5 };
      this.satellites.add(sat);
    }
    this.group.add(this.satellites);
  }

  initDragControls() {
    const canvas = document.getElementById('webgl-container');
    if (!canvas) return;

    canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.prevMousePos.x;
      const deltaY = e.clientY - this.prevMousePos.y;

      this.dragVelocity.x = deltaX * 0.008;
      this.dragVelocity.y = deltaY * 0.008;

      this.group.rotation.y += this.dragVelocity.x;
      this.group.rotation.x += this.dragVelocity.y;

      this.prevMousePos = { x: e.clientX, y: e.clientY };
    });

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - this.prevMousePos.x;
      const deltaY = e.touches[0].clientY - this.prevMousePos.y;

      this.group.rotation.y += deltaX * 0.008;
      this.group.rotation.x += deltaY * 0.008;

      this.prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });
  }

  setShape(type) {
    if (!this.geometries[type] || this.currentShapeType === type) return;
    this.currentShapeType = type;

    // Smooth transition scale morphing
    gsap.to(this.group.scale, {
      x: 0.01,
      y: 0.01,
      z: 0.01,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        this.mesh.geometry = this.geometries[type];
        this.wireframeMesh.geometry = this.geometries[type];

        gsap.to(this.group.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.5,
          ease: 'back.out(1.7)'
        });
      }
    });
  }

  setTextureMode(texKey) {
    this.currentTexture = texKey;
    if (this.textures[texKey]) {
      this.mainMaterial.map = this.textures[texKey];
    } else {
      this.mainMaterial.map = null;
    }
    this.mainMaterial.needsUpdate = true;
  }

  setMaterialMode(mode) {
    this.materialMode = mode;
    if (mode === 'glass') {
      this.mainMaterial.transmission = 0.95;
      this.mainMaterial.roughness = 0.05;
      this.mainMaterial.metalness = 0.1;
      this.mainMaterial.opacity = 0.7;
      this.mainMaterial.wireframe = false;
      this.wireframeMesh.visible = true;
    } else if (mode === 'chrome') {
      this.mainMaterial.transmission = 0.0;
      this.mainMaterial.roughness = 0.08;
      this.mainMaterial.metalness = 1.0;
      this.mainMaterial.opacity = 1.0;
      this.mainMaterial.wireframe = false;
      this.wireframeMesh.visible = false;
    } else if (mode === 'wireframe') {
      this.mainMaterial.wireframe = true;
      this.wireframeMesh.visible = false;
    } else { // hologram
      this.mainMaterial.transmission = 0.5;
      this.mainMaterial.roughness = 0.15;
      this.mainMaterial.metalness = 0.8;
      this.mainMaterial.opacity = 0.9;
      this.mainMaterial.wireframe = false;
      this.wireframeMesh.visible = true;
    }
    this.mainMaterial.needsUpdate = true;
  }

  toggleExplode() {
    this.isExploded = !this.isExploded;

    if (this.isExploded) {
      // Explode outwards
      gsap.to(this.wireframeMesh.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 0.8, ease: 'back.out(1.5)' });
      gsap.to(this.orbitGroup.scale, { x: 1.6, y: 1.6, z: 1.6, duration: 0.8, ease: 'back.out(1.5)' });
      gsap.to(this.innerCore.scale, { x: 0.4, y: 0.4, z: 0.4, duration: 0.8, ease: 'power2.out' });
      gsap.to(this.satellites.scale, { x: 1.8, y: 1.8, z: 1.8, duration: 0.8, ease: 'back.out(1.5)' });
    } else {
      // Snap back together
      gsap.to(this.wireframeMesh.scale, { x: 1.03, y: 1.03, z: 1.03, duration: 0.6, ease: 'power3.out' });
      gsap.to(this.orbitGroup.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.6, ease: 'power3.out' });
      gsap.to(this.innerCore.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.6, ease: 'power3.out' });
      gsap.to(this.satellites.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.6, ease: 'power3.out' });
    }
    return this.isExploded;
  }

  setSpeed(speed) {
    this.rotationSpeed = parseFloat(speed);
  }

  onThemeChange(primary, secondary) {
    this.primaryColor.copy(primary);
    this.secondaryColor.copy(secondary);

    this.mainMaterial.emissive.copy(primary);
    this.wireMaterial.color.copy(primary);
    this.innerCoreMat.color.copy(primary);
    this.ring1.material.color.copy(secondary);
    this.ring2.material.color.copy(primary);

    if (this.satellites) {
      this.satellites.children.forEach((sat, idx) => {
        sat.material.color.copy((idx % 2 === 0) ? primary : secondary);
      });
    }
  }

  update(time, delta, mouse) {
    const spd = this.rotationSpeed;

    // Apply auto-spin with smooth damping
    if (!this.isDragging) {
      this.group.rotation.x += delta * 0.35 * spd;
      this.group.rotation.y += delta * 0.55 * spd;
      
      // Momentum dampening from user drag
      this.dragVelocity.x *= 0.92;
      this.dragVelocity.y *= 0.92;
      this.group.rotation.y += this.dragVelocity.x;
      this.group.rotation.x += this.dragVelocity.y;
    }

    // Mouse parallax reaction
    this.group.position.x = mouse.x * 1.5;
    this.group.position.y = mouse.y * 1.2;

    // Orbit rings spin
    if (this.ring1) this.ring1.rotation.z += delta * 0.8;
    if (this.ring2) this.ring2.rotation.x += delta * 0.5;

    // Inner core counter-rotation & pulsing
    if (this.innerCore) {
      this.innerCore.rotation.y -= delta * 0.9;
      this.innerCore.rotation.z += delta * 0.6;
      const pulse = 1.0 + Math.sin(time * 3.0) * 0.08;
      if (!this.isExploded) {
        this.innerCore.scale.set(pulse, pulse, pulse);
      }
    }

    // Orbiting satellites
    if (this.satellites) {
      this.satellites.children.forEach(sat => {
        sat.userData.angle += delta * sat.userData.speed;
        const a = sat.userData.angle;
        const d = sat.userData.dist;
        sat.position.set(Math.cos(a) * d, Math.sin(a * 1.5) * (d * 0.5), Math.sin(a) * d);
        sat.rotation.x += delta * 2;
        sat.rotation.y += delta * 2;
      });
    }

    // Floating breathing oscillation
    this.group.position.y += Math.sin(time * 1.8) * 0.004;
  }
}
