import * as THREE from 'three';

export class FloatingNodes {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.nodes = [];
    this.raycaster = new THREE.Raycaster();
    this.hoveredNode = null;

    this.primaryColor = new THREE.Color(0x00f3ff);
    this.secondaryColor = new THREE.Color(0xff007f);

    this.createNodes();
  }

  createNodes() {
    const nodeData = [
      { pos: [-12, 6, -15], size: 1.6, shape: 'tetra' },
      { pos: [14, 8, -20], size: 2.0, shape: 'octa' },
      { pos: [-15, -10, -30], size: 2.2, shape: 'dodeca' },
      { pos: [12, -8, -25], size: 1.8, shape: 'icosa' },
      { pos: [0, 15, -40], size: 2.5, shape: 'torus' }
    ];

    nodeData.forEach((data, idx) => {
      let geo;
      switch (data.shape) {
        case 'tetra': geo = new THREE.TetrahedronGeometry(data.size); break;
        case 'octa': geo = new THREE.OctahedronGeometry(data.size); break;
        case 'dodeca': geo = new THREE.DodecahedronGeometry(data.size); break;
        case 'icosa': geo = new THREE.IcosahedronGeometry(data.size); break;
        case 'torus': geo = new THREE.TorusGeometry(data.size, 0.4, 16, 50); break;
        default: geo = new THREE.BoxGeometry(data.size, data.size, data.size);
      }

      const mat = new THREE.MeshPhysicalMaterial({
        color: 0x050d24,
        emissive: idx % 2 === 0 ? this.primaryColor : this.secondaryColor,
        emissiveIntensity: 0.3,
        roughness: 0.2,
        metalness: 0.8,
        wireframe: false,
        transparent: true,
        opacity: 0.85
      });

      const wireGeo = new THREE.WireframeGeometry(geo);
      const wireMat = new THREE.LineBasicMaterial({
        color: idx % 2 === 0 ? this.primaryColor : this.secondaryColor,
        transparent: true,
        opacity: 0.6
      });

      const mesh = new THREE.Mesh(geo, mat);
      const wire = new THREE.LineSegments(wireGeo, wireMat);
      mesh.add(wire);

      mesh.position.set(...data.pos);
      mesh.userData = {
        id: idx,
        basePos: { ...mesh.position },
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.8,
          y: (Math.random() - 0.5) * 0.8
        },
        floatOffset: Math.random() * Math.PI * 2
      };

      this.group.add(mesh);
      this.nodes.push(mesh);
    });
  }

  onThemeChange(primary, secondary) {
    this.primaryColor.copy(primary);
    this.secondaryColor.copy(secondary);

    this.nodes.forEach((mesh, idx) => {
      const col = idx % 2 === 0 ? primary : secondary;
      mesh.material.emissive.copy(col);
      if (mesh.children[0] && mesh.children[0].material) {
        mesh.children[0].material.color.copy(col);
      }
    });
  }

  update(time, delta, mouse) {
    this.nodes.forEach(node => {
      // Rotation
      node.rotation.x += delta * node.userData.rotSpeed.x;
      node.rotation.y += delta * node.userData.rotSpeed.y;

      // Floating sine oscillation
      node.position.y = node.userData.basePos.y + Math.sin(time * 1.2 + node.userData.floatOffset) * 0.8;
      node.position.x = node.userData.basePos.x + Math.cos(time * 0.9 + node.userData.floatOffset) * 0.4;
    });
  }
}
