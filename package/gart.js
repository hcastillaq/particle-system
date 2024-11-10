import { AdditiveBlending, BufferGeometry, PerspectiveCamera, Points, PointsMaterial, Scene, WebGLRenderer, } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
export class GArt {
    config;
    scene = new Scene();
    camera = new PerspectiveCamera();
    renderer = new WebGLRenderer();
    geometry = new BufferGeometry();
    material = new PointsMaterial();
    points = new Points();
    orbitControl;
    stats = new Stats();
    idAnimation = 0;
    defaultOrbitControlConfig = {
        enableDamping: true,
        dampingFactor: 0.25,
        enableZoom: true,
        autoRotate: true,
        autoRotateSpeed: 0.5,
    };
    constructor(config) {
        this.config = config;
        this.configureCamera();
        this.configureRenderer();
        this.configureMaterial();
        this.configurePoints();
        this.configureOrbitControl();
    }
    getWindowSize = () => {
        return {
            WIDTH: window.innerWidth,
            HEIGHT: window.innerHeight,
        };
    };
    configureCamera = () => {
        const { WIDTH, HEIGHT } = this.getWindowSize();
        const CAMERA = new PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 10000);
        CAMERA.position.z = this.config.zoom ? this.config.zoom : 500;
        this.camera = CAMERA;
    };
    configureRenderer = () => {
        const { WIDTH, HEIGHT } = this.getWindowSize();
        const RENDERER = new WebGLRenderer({
            antialias: false,
            powerPreference: 'high-performance',
        });
        RENDERER.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
        RENDERER.setSize(WIDTH, HEIGHT);
        this.renderer = RENDERER;
    };
    configureMaterial = () => {
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
    configurePoints = () => {
        this.points = new Points(this.geometry, this.material);
    };
    setStatsToContainer = () => {
        if (this.config.stats) {
            this.config.container.appendChild(this.stats.dom);
        }
    };
    configureOrbitControl = () => {
        const config = {
            ...this.defaultOrbitControlConfig,
            ...this.config.orbitConfig,
        };
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.enableDamping = config.enableDamping ? true : false;
        controls.dampingFactor = config.dampingFactor ? config.dampingFactor : 0.25;
        controls.enableZoom = config.enableZoom ? true : false;
        controls.autoRotate = config.autoRotate ? true : false;
        controls.autoRotateSpeed = config.autoRotateSpeed
            ? config.autoRotateSpeed
            : 0.3;
        this.orbitControl = controls;
    };
    windowResize = (camera, renderer) => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    addWindowResizeListener = () => {
        window.addEventListener('resize', () => this.windowResize(this.camera, this.renderer), false);
    };
    rotate = () => {
        if (this.config.orbitConfig?.autoRotate) {
            this.scene.rotateX(((-90 * Math.PI) / 180) * 0.001);
            this.scene.rotateY(((90 * Math.PI) / 180) * 0.001);
        }
    };
    changeColor = (color) => {
        this.material.color.set(color);
    };
    changeOpacity = (opacity) => {
        this.material.opacity = opacity;
    };
    takePhoto = () => {
        this.renderer.render(this.scene, this.camera);
        this.renderer.domElement.toBlob(function (blob) {
            if (blob !== null) {
                var a = document.createElement('a');
                var url = URL.createObjectURL(blob);
                a.href = url;
                a.download = 'particles.png';
                a.click();
            }
        }, 'image/png', 1);
    };
    stop = () => {
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
        window.removeEventListener('resize', () => this.windowResize(this.camera, this.renderer), false);
    };
    animate = () => {
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
    load = () => {
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
            changeColor: (color) => {
                this.changeColor(color);
            },
            changeOpacity: (opacity) => {
                this.changeOpacity(opacity);
            },
            takePhoto: () => {
                this.takePhoto();
            },
        };
    };
    static convertColorStringToNumber = (color) => {
        if (color.length === 7 && color.includes('#')) {
            const newColor = `0x${color.split('#')[1]}`;
            return parseInt(newColor);
        }
        return 0xffffff;
    };
    static convertColorNumberToString = (color) => {
        return `#${color.toString(16).padStart(6, '0')}`;
    };
}
