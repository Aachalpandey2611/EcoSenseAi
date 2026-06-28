import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useSettingsStore } from '@/store/settingsStore';

interface OrbProps {
  position: [number, number, number];
  colorLight: string;
  colorDark: string;
  speed: number;
  distort: number;
  scale: number;
  theme: string;
}

function Orb({ position, colorLight, colorDark, speed, distort, scale, theme }: OrbProps) {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5;
      ref.current.rotation.x = state.clock.elapsedTime * speed * 0.5;
      ref.current.rotation.y = state.clock.elapsedTime * speed * 0.3;
    }
  });

  return (
    <Sphere ref={ref} args={[1, 64, 64]} position={position} scale={scale}>
      {theme === 'dark' ? (
        <meshStandardMaterial
          color="#060D16"
          emissive={colorDark}
          emissiveIntensity={0.4}
          roughness={0.1}
        />
      ) : (
        <MeshDistortMaterial
          color={colorLight}
          envMapIntensity={0.5}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          metalness={0.1}
          roughness={0.2}
          transmission={0.1}
          distort={distort}
          speed={speed * 2}
        />
      )}
    </Sphere>
  );
}

export default function FloatingOrbs() {
  const theme = useSettingsStore((state) => state.theme);

  return (
    <>
      {theme === 'dark' ? (
        <>
          <pointLight position={[0, 3, 3]} intensity={1.5} color="#00FF9D" />
          <ambientLight intensity={0.5} color="#001833" />
        </>
      ) : (
        <>
          <directionalLight position={[5, 10, 5]} intensity={2.0} color="#FFF5E0" />
          <ambientLight intensity={0.8} color="#E8F5EC" />
          <hemisphereLight intensity={0.5} color="#ffffff" groundColor="#E8F0E4" />
        </>
      )}
      
      {/* Carbon Orb */}
      <Orb position={[-4, 2, -5]} colorLight="#1A7A4A" colorDark="#00FF9D" speed={0.5} distort={0.3} scale={1.5} theme={theme} />
      {/* Water Orb */}
      <Orb position={[4, -2, -8]} colorLight="#2D7DD2" colorDark="#00CFFF" speed={0.4} distort={0.4} scale={2} theme={theme} />
      {/* Energy Orb */}
      <Orb position={[0, -4, -4]} colorLight="#E8A020" colorDark="#FF9500" speed={0.6} distort={0.5} scale={1.2} theme={theme} />
      {/* Waste Orb */}
      <Orb position={[-3, -3, -6]} colorLight="#4A6B5A" colorDark="#00FF9D" speed={0.3} distort={0.2} scale={1.8} theme={theme} />
    </>
  );
}
