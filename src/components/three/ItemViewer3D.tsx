"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";

/** Garment photo wrapped on a gently curved, swaying "dress form" panel you can orbit. */
function Panel({ image }: { image: string }) {
  const texture = useTexture(image);
  texture.colorSpace = THREE.SRGBColorSpace;
  const ref = useRef<THREE.Mesh>(null);

  // A slice of cylinder reads as fabric draped over a form
  const geometry = useMemo(() => new THREE.CylinderGeometry(1.4, 1.6, 3.2, 48, 1, true, -Math.PI / 3.2, (Math.PI / 3.2) * 2), []);

  useFrame((s) => {
    if (ref.current) ref.current.rotation.z = Math.sin(s.clock.elapsedTime * 0.8) * 0.015;
  });

  return (
    <group position={[0, 0.1, 0]}>
      <mesh ref={ref} geometry={geometry} position={[0, 0, -1.2]}>
        <meshStandardMaterial map={texture} side={THREE.DoubleSide} roughness={0.75} />
      </mesh>
      <mesh position={[0, 1.75, -0.2]}>
        <torusGeometry args={[0.16, 0.02, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#C9A24B" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

export default function ItemViewer3D({ image }: { image: string }) {
  return (
    <div className="h-full w-full" aria-label="Interactive 3D preview. Drag to rotate." role="img">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.2, 4.2], fov: 42 }}>
        <color attach="background" args={["#EFE8DD"]} />
        <ambientLight intensity={1.1} />
        <directionalLight position={[3, 4, 5]} intensity={1.4} />
        <Suspense fallback={null}>
          <Panel image={image} />
        </Suspense>
        <ContactShadows position={[0, -1.55, 0]} opacity={0.35} blur={2.4} scale={6} />
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={1.2} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.8} />
      </Canvas>
      <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-ivory/90 px-3 py-1.5 text-xs font-medium">Drag to rotate</p>
    </div>
  );
}
