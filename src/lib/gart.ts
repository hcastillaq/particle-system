import {
  AdditiveBlending,
  BufferGeometry,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import {
  GArtCallbacks,
  GArtConfig,
  GArtOrbitControlConfig,
} from './interfaces';

export class GArt {
  private scene = new Scene();
  private camera: PerspectiveCamera = new PerspectiveCamera();
  private renderer: WebGLRenderer = new WebGLRenderer();
  private geometry: BufferGeometry = new BufferGeometry();
  private material: PointsMaterial = new PointsMaterial();
  private points: Points = new Points();
  private orbitControl: OrbitControls;
  private stats = new Stats();
  private idAnimation: number = 0;

  private defaultOrbitControlConfig: GArtOrbitControlConfig = {
    enableDamping: true,
    dampingFactor: 0.25,
    enableZoom: true,
    autoRotate: true,
    autoRotateSpeed: 0.5,
  };

  constructor(readonly config: GArtConfig) {
    this.configureCamera();
    this.configureRenderer();
    this.configureMaterial();
    this.configurePoints();
    this.configureOrbitControl();
  }

  private getWindowSize = () => {
    return {
      WIDTH: window.innerWidth,
      HEIGHT: window.innerHeight,
    };
  };

  private configureCamera = () => {
    const { WIDTH, HEIGHT } = this.getWindowSize();
    const CAMERA = new PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 10000);
    CAMERA.position.z = this.config.zoom ? this.config.zoom : 500;
    this.camera = CAMERA;
  };

  private configureRenderer = () => {
    const { WIDTH, HEIGHT } = this.getWindowSize();

    const RENDERER = new WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
    });

    RENDERER.setPixelRatio(
      window.devicePixelRatio ? window.devicePixelRatio : 1,
    );

    RENDERER.setSize(WIDTH, HEIGHT);

    this.renderer = RENDERER;
  };

  private configureMaterial = () => {
    const material = new PointsMaterial({
      transparent: true,
      opacity: this.config.material.opacity || 0.5,
      color: this.config.material.color,
      size: this.config.material.sizeParticle || 0.01,
      sizeAttenuation: true,
    });
    material.blending = AdditiveBlending;

    this.material = material;
  };

  private configurePoints = () => {
    this.points = new Points(this.geometry, this.material);
  };

  private setStatsToContainer = () => {
    if (this.config.stats) {
      this.config.container.appendChild(this.stats.dom);
    }
  };

  private configureOrbitControl = () => {
    const config = {
      ...this.defaultOrbitControlConfig,
      ...this.config.orbitConfig,
    };
    const controls: OrbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement,
    );

    controls.enableDamping = config.enableDamping ? true : false;
    controls.dampingFactor = config.dampingFactor ? config.dampingFactor : 0.25;
    controls.enableZoom = config.enableZoom ? true : false;
    controls.autoRotate = config.autoRotate ? true : false;
    controls.autoRotateSpeed = config.autoRotateSpeed
      ? config.autoRotateSpeed
      : 0.3;

    this.orbitControl = controls;
  };

  private windowResize = (
    camera: PerspectiveCamera,
    renderer: WebGLRenderer,
  ) => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private addWindowResizeListener = () => {
    window.addEventListener(
      'resize',
      () => this.windowResize(this.camera, this.renderer),
      false,
    );
  };

  private rotate = () => {
    if (this.config.orbitConfig?.autoRotate) {
      this.scene.rotateX(((-90 * Math.PI) / 180) * 0.001);
      this.scene.rotateY(((90 * Math.PI) / 180) * 0.001);
    }
  };

  private changeColor = (color: number) => {
    this.material.color.set(color);
  };

  private changeOpacity = (opacity: number) => {
    this.material.opacity = opacity;
  };

  private takePhoto = () => {
    this.renderer.render(this.scene, this.camera);
    this.renderer.domElement.toBlob(
      function (blob) {
        if (blob !== null) {
          var a = document.createElement('a');
          var url = URL.createObjectURL(blob);
          a.href = url;
          a.download = 'particles.png';
          a.click();
        }
      },
      'image/png',
      1,
    );
  };

  private stop = () => {
    cancelAnimationFrame(this.idAnimation);
    this.geometry.dispose();
    this.material.dispose();
    this.orbitControl.dispose();
    this.renderer.clear();
    this.camera.position.set(0, 0, 0);
    this.camera.lookAt(0, 0, 0);
    this.camera.clear();
    this.scene.rotation.set(0, 0, 0);
    this.scene.remove(this.points);
    this.scene.remove(this.camera);
    this.scene.clear();
    this.config.system.dispose();
    window.removeEventListener(
      'resize',
      () => this.windowResize(this.camera, this.renderer),
      false,
    );
  };

  private animate = () => {
    this.idAnimation = requestAnimationFrame(this.animate);

    const system = this.config.system;
    system.update();

    this.rotate();

    if (this.config.stats) {
      this.stats.update();
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  };

  public load = (): GArtCallbacks => {
    this.config.container.appendChild(this.renderer.domElement);

    this.setStatsToContainer();
    this.scene.add(this.points);

    return {
      start: () => {
        this.config.system.setGeometry(this.geometry);
        this.addWindowResizeListener();
        this.animate();
      },
      stop: () => {
        this.stop();
      },
      changeColor: (color: number) => {
        this.changeColor(color);
      },
      changeOpacity: (opacity: number) => {
        this.changeOpacity(opacity);
      },
      takePhoto: () => {
        this.takePhoto();
      },
    };
  };

  public static convertColorStringToNumber = (color: string): number => {
    if (color.length === 7 && color.includes('#')) {
      const newColor = `0x${color.split('#')[1]}`;
      return parseInt(newColor);
    }
    return 0xffffff;
  };

  public static convertColorNumberToString = (color: number) => {
    return `#${color.toString(16).padStart(6, '0')}`;
  };
}
