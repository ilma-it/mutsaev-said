/* ===================================================
   THREE.JS 3D MODEL VIEWER (FRAME 3) - MOBILE OPTIMIZED
   =================================================== */

class Greenhouse3DViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.modelGroup = null;
    this.lights = {};
    
    // Performance state & Mobile detection
    this.isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 768;
    this.isPageVisible = true;
    this.autoRotate = false;
    this.isWireframe = false;
    this.currentLightMode = 'day'; // 'day', 'studio', 'growlight'
    this.defaultCameraPos = new THREE.Vector3(12, 10, 16);
    this.targetCenter = new THREE.Vector3(0, 0, 0);

    this.init();
  }

  init() {
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initControls();
    this.initLights();
    this.initGridAndEnvironment();
    this.loadModel();
    this.bindEvents();
    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x15161c);
    this.scene.fog = new THREE.FogExp2(0x15161c, 0.015);
  }

  initCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 2000);
    this.camera.position.copy(this.defaultCameraPos);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: !this.isMobile, // Disable expensive MSAA on mobile for 60fps
      alpha: false,
      powerPreference: 'high-performance' 
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    
    // Adaptive pixel ratio for weak mobile GPUs
    const maxRatio = this.isMobile ? 1.35 : 2;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxRatio));
    
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = this.isMobile ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.container.appendChild(this.renderer.domElement);
  }

  initControls() {
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.08;
      this.controls.maxPolarAngle = Math.PI / 2 + 0.05; // Don't go below ground
      this.controls.minDistance = 2;
      this.controls.maxDistance = 100;
      this.controls.target.copy(this.targetCenter);
      this.controls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN
      };
    }
  }

  initLights() {
    // Ambient Light
    this.lights.ambient = new THREE.AmbientLight(0xffffff, 1.4);
    this.scene.add(this.lights.ambient);

    // Sun / Main Directional Light
    this.lights.sun = new THREE.DirectionalLight(0xfffdf0, 2.5);
    this.lights.sun.position.set(25, 40, 20);
    this.lights.sun.castShadow = true;
    
    // Reduced shadow resolution on mobile to save VRAM and battery
    const shadowRes = this.isMobile ? 1024 : 2048;
    this.lights.sun.shadow.mapSize.width = shadowRes;
    this.lights.sun.shadow.mapSize.height = shadowRes;
    this.lights.sun.shadow.bias = -0.0001;
    this.scene.add(this.lights.sun);

    // Fill Soft Light
    this.lights.fill = new THREE.DirectionalLight(0xa5c4f2, 1.0);
    this.lights.fill.position.set(-20, 20, -20);
    this.scene.add(this.lights.fill);

    // LED Grow Light (Special phyto-spectrum: deep pink/violet for plants)
    this.lights.growLight = new THREE.PointLight(0xff007f, 0, 35);
    this.lights.growLight.position.set(0, 8, 0);
    this.scene.add(this.lights.growLight);
  }

  initGridAndEnvironment() {
    // Circular Ground Shadow Disc
    const groundGeo = new THREE.CircleGeometry(50, this.isMobile ? 32 : 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x111216,
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Subtle Grid helper
    const grid = new THREE.GridHelper(60, this.isMobile ? 30 : 60, 0xd0bf26, 0x272a36);
    grid.position.y = 0;
    this.scene.add(grid);
  }

  loadModel() {
    const loaderEl = document.getElementById('viewerLoader');
    const progressFill = document.getElementById('loaderProgressFill');

    const glbUrl = '3Dmodel/3Dteplica.glb';

    const onModelLoaded = (modelScene) => {
      this.modelGroup = new THREE.Group();
      this.modelGroup.add(modelScene);

      // Compute bounding box to center & auto-scale model nicely
      const box = new THREE.Box3().setFromObject(modelScene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const scaleFactor = 12 / maxDim;

      modelScene.scale.set(scaleFactor, scaleFactor, scaleFactor);
      modelScene.position.x = -center.x * scaleFactor;
      modelScene.position.y = -box.min.y * scaleFactor; // Place bottom on ground
      modelScene.position.z = -center.z * scaleFactor;

      // Enhance materials, double-sided rendering & shadows
      modelScene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          if (child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach(mat => {
              mat.side = THREE.DoubleSide; // Prevents backface culling
              
              if (mat.name && mat.name.toLowerCase().includes('glass')) {
                mat.transparent = true;
                mat.opacity = 0.4;
                mat.roughness = 0.1;
                mat.metalness = 0.9;
              }
            });
          }
        }
      });

      this.scene.add(this.modelGroup);

      // Adjust camera to frame model
      const modelHeight = size.y * scaleFactor;
      this.targetCenter.set(0, modelHeight / 2, 0);
      if (this.controls) {
        this.controls.target.copy(this.targetCenter);
        this.camera.position.set(12, modelHeight * 1.3, 16);
        this.defaultCameraPos.copy(this.camera.position);
        this.controls.update();
      }

      // Hide loader
      if (loaderEl) {
        loaderEl.classList.add('loaded');
      }
    };

    const onProgress = (xhr) => {
      if (xhr.lengthComputable && progressFill) {
        const percent = (xhr.loaded / xhr.total) * 100;
        progressFill.style.width = `${percent}%`;
      }
    };

    const onError = (error) => {
      console.error('Error loading 3D model:', error);
      if (loaderEl) {
        loaderEl.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <h3 style="color: #e11d48; margin-bottom: 12px;">Ошибка загрузки 3D модели</h3>
            <p style="color: #94a3b8; max-width: 480px; margin-bottom: 20px;">
              Не удалось загрузить файл 3Dmodel/3Dteplica.glb. Убедитесь, что сайт запущен через локальный сервер (start_site.bat).
            </p>
            <button class="btn btn-primary" onclick="location.reload()">Повторить</button>
          </div>
        `;
      }
    };

    // Load with GLTFLoader
    if (typeof THREE.GLTFLoader !== 'undefined') {
      const gltfLoader = new THREE.GLTFLoader();
      gltfLoader.load(
        glbUrl,
        (gltf) => onModelLoaded(gltf.scene),
        onProgress,
        onError
      );
    }
  }

  setLightMode(mode) {
    this.currentLightMode = mode;
    if (mode === 'day') {
      this.scene.background.set(0x15161c);
      this.lights.ambient.intensity = 1.4;
      this.lights.ambient.color.set(0xffffff);
      this.lights.sun.intensity = 2.5;
      this.lights.growLight.intensity = 0;
    } else if (mode === 'studio') {
      this.scene.background.set(0x0e0f14);
      this.lights.ambient.intensity = 0.8;
      this.lights.ambient.color.set(0xd0bf26);
      this.lights.sun.intensity = 3.2;
      this.lights.growLight.intensity = 0;
    } else if (mode === 'growlight') {
      // Phyto grow light night mode
      this.scene.background.set(0x0a0512);
      this.lights.ambient.intensity = 0.3;
      this.lights.ambient.color.set(0x400030);
      this.lights.sun.intensity = 0.2;
      this.lights.growLight.intensity = 4.0;
    }
  }

  toggleWireframe() {
    this.isWireframe = !this.isWireframe;
    if (this.modelGroup) {
      this.modelGroup.traverse((child) => {
        if (child.isMesh && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach(m => m.wireframe = this.isWireframe);
        }
      });
    }
    return this.isWireframe;
  }

  toggleAutoRotate() {
    this.autoRotate = !this.autoRotate;
    return this.autoRotate;
  }

  setViewpoint(view) {
    if (!this.controls) return;
    const dist = 18;
    const targetY = this.targetCenter.y;

    if (view === 'iso') {
      this.tweenCamera(new THREE.Vector3(12, 10, 16));
    } else if (view === 'top') {
      this.tweenCamera(new THREE.Vector3(0.01, dist * 1.2, 0.01));
    } else if (view === 'front') {
      this.tweenCamera(new THREE.Vector3(0, targetY, dist));
    } else if (view === 'side') {
      this.tweenCamera(new THREE.Vector3(dist, targetY, 0));
    }
  }

  tweenCamera(targetPos) {
    const startPos = this.camera.position.clone();
    let progress = 0;
    const duration = 30; // Faster transition for snappy feel

    const animateTransition = () => {
      progress++;
      const t = progress / duration;
      const ease = t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

      this.camera.position.lerpVectors(startPos, targetPos, ease);
      this.controls.update();

      if (progress < duration) {
        requestAnimationFrame(animateTransition);
      }
    };
    animateTransition();
  }

  resetView() {
    this.setViewpoint('iso');
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      if (!this.container || !this.renderer || !this.camera) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }, { passive: true });

    // Battery & CPU saver: pause render loop when browser tab/window is hidden
    document.addEventListener('visibilitychange', () => {
      this.isPageVisible = !document.hidden;
    });

    // HUD Buttons bindings
    const autoRotateBtn = document.getElementById('btnAutoRotate');
    const wireframeBtn = document.getElementById('btnWireframe');
    const resetBtn = document.getElementById('btnResetCamera');
    const lightBtn = document.getElementById('btnLightMode');
    const viewPills = document.querySelectorAll('.pill-btn');

    autoRotateBtn?.addEventListener('click', () => {
      const active = this.toggleAutoRotate();
      autoRotateBtn.classList.toggle('active', active);
    });

    wireframeBtn?.addEventListener('click', () => {
      const active = this.toggleWireframe();
      wireframeBtn.classList.toggle('active', active);
    });

    resetBtn?.addEventListener('click', () => {
      this.resetView();
    });

    lightBtn?.addEventListener('click', () => {
      const modes = ['day', 'studio', 'growlight'];
      const nextMode = modes[(modes.indexOf(this.currentLightMode) + 1) % modes.length];
      this.setLightMode(nextMode);
      
      const labels = {
        day: '☀️ День',
        studio: '💡 Студия',
        growlight: '🌸 Фитосвет'
      };
      lightBtn.querySelector('.light-label').textContent = labels[nextMode];
    });

    viewPills.forEach(pill => {
      pill.addEventListener('click', () => {
        viewPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.setViewpoint(pill.dataset.view);
      });
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Skip rendering if tab is hidden in background
    if (!this.isPageVisible) return;

    if (this.autoRotate && this.modelGroup) {
      this.modelGroup.rotation.y += 0.008;
    }

    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Instantiate on load
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('canvas3d-container')) {
    window.greenhouseViewer = new Greenhouse3DViewer('canvas3d-container');
  }
});
