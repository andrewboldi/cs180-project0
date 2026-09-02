/* CS180 Project 0 — beige optics: brass lens rings, drifting dust,
   aperture-iris loader, ScrollSmoother + scroll-triggered reveals. */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

window.__animBooted = true;

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

/* ————————————————— three.js scene ————————————————— */

const scroll = { target: 0, value: 0 };
let rings = null;

try {
  const canvas = document.getElementById('scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xe9e1d0, 6.5, 13);

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 40);
  camera.position.set(0, 0, 6);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const keyLight = new THREE.DirectionalLight(0xfff1da, 1.4);
  keyLight.position.set(-3, 4, 5);
  scene.add(keyLight);
  scene.add(new THREE.AmbientLight(0xe9e1d0, 0.35));

  const matBrass = new THREE.MeshStandardMaterial({
    color: 0xb08d57, metalness: 0.92, roughness: 0.3,
    envMapIntensity: 1.2, transparent: true, opacity: 1,
  });
  const matBrassDark = new THREE.MeshStandardMaterial({
    color: 0x7c5e31, metalness: 0.88, roughness: 0.42,
    envMapIntensity: 1.0, transparent: true, opacity: 0.95,
  });
  const matBrassThin = new THREE.MeshStandardMaterial({
    color: 0xc4a36c, metalness: 0.9, roughness: 0.25,
    envMapIntensity: 1.25, transparent: true, opacity: 0.9,
  });
  const ringMats = [matBrass, matBrassDark, matBrassThin];
  const baseOpacity = ringMats.map((m) => m.opacity);

  rings = new THREE.Group();
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.32, 0.052, 48, 220), matBrass);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.66, 0.02, 32, 240), matBrassDark);
  const ring3 = new THREE.Mesh(new THREE.TorusGeometry(1.02, 0.014, 32, 200), matBrassThin);
  ring2.rotation.x = 0.22;
  ring3.rotation.y = 0.3;
  rings.add(ring1, ring2, ring3);
  rings.rotation.set(0.3, -0.3, 0.05);
  scene.add(rings);

  /* soft round sprite so dust reads as motes, not squares */
  const dustSprite = (() => {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.4, 'rgba(255,255,255,0.55)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();

  const makeDust = (count, spread, size, opacity) => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * spread.x;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread.y;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread.z;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x8a6d40, size, sizeAttenuation: true, map: dustSprite,
      transparent: true, opacity, depthWrite: false,
    });
    return new THREE.Points(geo, mat);
  };

  const dustFar = makeDust(190, { x: 14, y: 9, z: 5 }, 0.055, 0.4);
  const dustNear = makeDust(90, { x: 10, y: 7, z: 3 }, 0.08, 0.26);
  dustFar.position.z = -2;
  scene.add(dustFar, dustNear);

  const mouse = { tx: 0, ty: 0, x: 0, y: 0 };
  if (!reducedMotion) {
    window.addEventListener('pointermove', (e) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  let ringBaseY = 0.45;
  const layout = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (w < 820) {
      rings.position.x = 0;
      rings.scale.setScalar(0.5);
      camera.position.z = 6.9;
      ringBaseY = 1.15;
    } else {
      rings.position.x = 2.1;
      rings.scale.setScalar(0.8);
      camera.position.z = 6;
      ringBaseY = 0.45;
    }
  };
  layout();
  window.addEventListener('resize', layout);

  const clock = new THREE.Clock();
  let rafId = null;

  const frame = () => {
    const t = clock.getElapsedTime();

    ring1.rotation.z = t * 0.05;
    ring1.rotation.x = Math.sin(t * 0.18) * 0.1;
    ring2.rotation.z = -t * 0.04;
    ring2.rotation.y = 0.2 + Math.sin(t * 0.14) * 0.12;
    ring3.rotation.z = t * 0.07;
    ring3.rotation.x = 0.5 + Math.sin(t * 0.11) * 0.08;

    dustFar.rotation.y = t * 0.012;
    dustNear.rotation.y = -t * 0.009;
    dustNear.position.y = Math.sin(t * 0.2) * 0.15;

    mouse.x += (mouse.tx - mouse.x) * 0.035;
    mouse.y += (mouse.ty - mouse.y) * 0.035;
    scroll.value += (scroll.target - scroll.value) * 0.06;

    rings.rotation.y = -0.3 + mouse.x * 0.14;
    rings.rotation.x = 0.3 - mouse.y * 0.1 + scroll.value * 0.5;
    rings.position.y = ringBaseY + Math.sin(t * 0.5) * 0.06 + scroll.value * 2.6;

    const fade = Math.max(0, 1 - scroll.value * 1.3);
    ringMats.forEach((m, i) => { m.opacity = baseOpacity[i] * fade; });

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(frame);
  };

  if (reducedMotion) {
    renderer.render(scene, camera);
  } else {
    frame();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        rafId = null;
      } else if (rafId === null) {
        clock.getDelta();
        frame();
      }
    });
  }
  window.__dbgRings = () => ({
    op: ringMats.map((m) => m.opacity),
    y: rings.position.y,
    x: rings.position.x,
    sv: scroll.value,
    st: scroll.target,
  });
} catch (err) {
  console.warn('3D scene unavailable, continuing without it:', err);
}

/* ————————————————— gsap: smoother + transitions ————————————————— */

const nav = document.getElementById('nav');

if (reducedMotion) {
  document.documentElement.classList.add('no-anim');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
} else {
  const smoother = ScrollSmoother.create({
    wrapper: '#smooth-wrapper',
    content: '#smooth-content',
    smooth: 1.4,
    effects: true,
  });

  /* rings respond to the first ~1.8 viewports of scroll */
  ScrollTrigger.create({
    start: 0,
    end: () => window.innerHeight * 1.8,
    onUpdate: (self) => { scroll.target = self.progress; },
  });

  /* nav: frost when scrolled, tuck away when scrolling down */
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle('scrolled', y > 60);
      if (y > 160 && self.direction === 1) {
        gsap.to(nav, { yPercent: -120, duration: 0.55, ease: 'power2.out', overwrite: 'auto' });
      } else {
        gsap.to(nav, { yPercent: 0, duration: 0.55, ease: 'power2.out', overwrite: 'auto' });
      }
    },
  });

  /* aperture-iris loader, then the hero settles in */
  const irisRadius = Math.hypot(window.innerWidth, window.innerHeight) * 0.55;
  gsap.set('.hero-sub', { y: 24 });

  const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
  intro
    .to('.loader-ring circle', {
      strokeDashoffset: 0, duration: 0.9, stagger: 0.18, ease: 'power2.inOut',
    })
    .to('.loader-mark', { opacity: 0, duration: 0.4, ease: 'power1.out' }, '+=0.1')
    .to('.iris-hole', { attr: { r: irisRadius }, duration: 1.25, ease: 'expo.inOut' }, '<0.05')
    .set('#loader', { display: 'none' })
    .to('.nav', { opacity: 1, duration: 0.9 }, '-=0.9')
    .to('.hero-eyebrow', { opacity: 1, duration: 0.8 }, '-=0.75')
    .to('.line', { y: 0, duration: 1.4, ease: 'power4.out', stagger: 0.14 }, '-=0.7')
    .to('.hero-sub', { opacity: 1, y: 0, duration: 1 }, '-=0.8')
    .to('.exif-strip', { opacity: 1, duration: 0.9 }, '-=0.6')
    .to('.scroll-cue', { opacity: 1, duration: 0.9 }, '-=0.5');

  if (rings) {
    intro.from(rings.scale, { x: 0.85, y: 0.85, z: 0.85, duration: 1.8, ease: 'power2.out' }, 1.2);
  }

  /* generic reveals */
  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.fromTo(el, { y: 44, opacity: 0 }, {
      y: 0,
      opacity: 1,
      duration: 1.3,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 86%' },
    });
  });

  /* frames: curtain reveal + slow settle */
  gsap.utils.toArray('.frame').forEach((el) => {
    const mask = el.querySelector('.frame-mask');
    const img = el.querySelector('img');
    const cap = el.querySelector('figcaption');
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 80%' },
    });
    tl.to(mask, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' })
      .fromTo(img, { scale: 1.16 }, { scale: 1, duration: 2.2, ease: 'power3.out' }, 0.15)
      .fromTo(cap, { opacity: 0, y: 12 }, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', immediateRender: true,
      }, 0.9);
  });

  /* re-measure trigger positions once fonts and images have settled */
  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  /* smooth anchor scrolling */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      smoother.scrollTo(target, true, 'top 90px');
    });
  });
}
