import { Canvas, useFrame } from "@react-three/fiber";
import { Outlines } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const BRUTAL_PINK = "#ff4fa8";
const BRUTAL_BLACK = "#0a0a0a";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);
  return reduced;
}

function buildToonGradient(steps: number) {
  const data = new Uint8Array(steps);
  for (let i = 0; i < steps; i++) {
    data[i] = Math.round(((i + 1) / steps) * 255);
  }
  const tex = new THREE.DataTexture(data, steps, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

function ToonIcosa({ paused }: { paused: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const gradientMap = useMemo(() => buildToonGradient(3), []);

  useEffect(() => {
    return () => gradientMap.dispose();
  }, [gradientMap]);

  useFrame((_, delta) => {
    if (paused || !ref.current) return;
    ref.current.rotation.x += delta * 0.25;
    ref.current.rotation.y += delta * 0.35;
  });

  return (
    <mesh ref={ref} rotation={[0.4, 0.6, 0]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshToonMaterial color={BRUTAL_PINK} gradientMap={gradientMap} />
      <Outlines
        thickness={6}
        color={BRUTAL_BLACK}
        screenspace
        polygonOffset
        polygonOffsetFactor={10}
      />
    </mesh>
  );
}

export default function HeroCanvas() {
  const reduced = useReducedMotion();
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 3.2], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <ToonIcosa paused={reduced} />
    </Canvas>
  );
}
