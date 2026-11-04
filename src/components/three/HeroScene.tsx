"use client";

import { useEffect, useMemo, useRef, useState } from "react";
// Fiber's own loader instead of drei's useTexture keeps drei (and three-stdlib) out of the hero chunk
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { img } from "@/lib/utils";

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uSeed;
  uniform float uWind;
  varying vec2 vUv;
  varying float vShade;
  void main() {
    vUv = uv;
    vec3 p = position;
    // Top edge stays pinned to the hanger; the hem swings most
    float pin = pow(1.0 - uv.y, 1.4);
    float wave = sin(p.x * 2.4 + uTime * 1.5 + uSeed) * 0.11
               + sin(p.y * 3.3 + uTime * 1.05 + uSeed * 2.0) * 0.07;
    p.z += wave * pin * (1.0 + uWind * 2.5);
    p.x += sin(uTime * 0.8 + p.y * 2.0 + uSeed) * 0.05 * pin;
    vShade = wave * pin;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uMap;
  varying vec2 vUv;
  varying float vShade;
  void main() {
    // Soft rounded corners
    vec2 q = abs(vUv - 0.5) * 2.0;
    vec2 r = max(q - vec2(0.86, 0.9), 0.0);
    float corner = 1.0 - smoothstep(0.06, 0.1, length(r));
    vec4 c = texture2D(uMap, vUv);
    c.rgb *= 0.9 + vShade * 1.8;
    gl_FragColor = vec4(c.rgb, corner);
    #include <colorspace_fragment>
  }
`;

const garments = [
  { id: "photo-1583391733956-3750e0ff4e8b", pos: [-1.9, 0.35, 0.2], scale: 1.05, seed: 0.3 },
  { id: "photo-1539008835657-9e8e9680c956", pos: [0.15, 0.85, -0.6], scale: 1.15, seed: 1.7 },
  { id: "photo-1617137968427-85924c800a22", pos: [2.05, 0.1, 0.1], scale: 1.0, seed: 2.9 },
  { id: "photo-1610030469983-98e550d6193c", pos: [-0.95, -1.35, 0.9], scale: 0.8, seed: 4.1 },
  { id: "photo-1469334031218-e382a71b716b", pos: [1.25, -1.45, 0.7], scale: 0.78, seed: 5.3 },
] as const;

const input = { x: 0, y: 0, scroll: 0, velocity: 0 };

function Garment({ url, position, scale, seed, lite }: { url: string; position: readonly number[]; scale: number; seed: number; lite: boolean }) {
  const texture = useLoader(THREE.TextureLoader, url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = lite ? 1 : 4;
  const mesh = useRef<THREE.Group>(null);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uSeed: { value: seed }, uWind: { value: 0 }, uMap: { value: texture } }),
    [seed, texture]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    uniforms.uTime.value = t;
    uniforms.uWind.value = THREE.MathUtils.lerp(uniforms.uWind.value, Math.min(Math.abs(input.velocity) * 0.02, 1), 0.08);
    if (mesh.current) {
      mesh.current.position.y = position[1] + Math.sin(t * 0.7 + seed) * 0.08;
      mesh.current.rotation.z = Math.sin(t * 0.5 + seed) * 0.03;
    }
  });

  return (
    <group ref={mesh} position={position as unknown as [number, number, number]} scale={scale}>
      {/* hanger rod */}
      <mesh position={[0, 0.98, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.9, 8]} />
        <meshBasicMaterial color="#C9A24B" />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <torusGeometry args={[0.07, 0.01, 6, 16, Math.PI * 1.4]} />
        <meshBasicMaterial color="#C9A24B" />
      </mesh>
      <mesh>
        <planeGeometry args={lite ? [1.5, 1.95, 14, 18] : [1.5, 1.95, 28, 36]} />
        <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Rig({ lite }: { lite: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const compact = viewport.aspect < 1;

  useFrame(() => {
    if (!group.current) return;
    const g = group.current;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, input.x * 0.35, 0.05);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -input.y * 0.18, 0.05);
    g.position.y = THREE.MathUtils.lerp(g.position.y, input.scroll * 0.0025, 0.1);
    input.velocity *= 0.92;
  });

  return (
    <group ref={group} scale={compact ? 0.68 : 1}>
      {(lite ? garments.slice(0, 3) : garments).map((g) => (
        <Garment key={g.id} url={img(g.id, lite ? 400 : 640)} position={g.pos} scale={g.scale} seed={g.seed} lite={lite} />
      ))}
    </group>
  );
}

export default function HeroScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  // Phones and touch tablets: 3 garments, coarser cloth mesh, 1x pixel ratio, no MSAA
  const [lite] = useState(() => window.matchMedia("(max-width: 767px), (pointer: coarse)").matches);

  useEffect(() => {
    let lastY = window.scrollY;
    const onMove = (e: PointerEvent) => {
      input.x = (e.clientX / window.innerWidth) * 2 - 1;
      input.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onScroll = () => {
      input.velocity += window.scrollY - lastY;
      lastY = window.scrollY;
      input.scroll = window.scrollY;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    // Stop rendering entirely when the hero is off screen
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    if (wrap.current) io.observe(wrap.current);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden>
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={lite ? 1 : [1, 1.5]}
        camera={{ position: [0, 0, 5.2], fov: 45 }}
        gl={{ antialias: !lite, alpha: true, powerPreference: lite ? "default" : "high-performance" }}
      >
        <Rig lite={lite} />
      </Canvas>
    </div>
  );
}
