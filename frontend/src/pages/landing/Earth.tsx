import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useSettingsStore } from '@/store/settingsStore';

export default function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const theme = useSettingsStore((state) => state.theme);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const scrollY = window.scrollY || 0;
    
    if (earthRef.current) {
      earthRef.current.rotation.y = t * 0.05 + scrollY * 0.002;
      earthRef.current.rotation.x = scrollY * 0.0005;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = t * 0.12;
      atmosphereRef.current.rotation.z = Math.sin(t * 0.5) * 0.05;
    }
  });

  return (
    <group>
      {theme === 'dark' ? (
        <>
          {/* Holographic Wireframe Earth */}
          <Sphere ref={earthRef} args={[2, 64, 64]}>
            <meshStandardMaterial
              color="#00FF9D"
              emissive="#00FF9D"
              emissiveIntensity={0.6}
              wireframe={true}
              transparent={true}
              opacity={0.3}
            />
          </Sphere>
          
          {/* Solid core to give depth */}
          <Sphere args={[1.9, 64, 64]}>
            <meshStandardMaterial
              color="#030b14"
              emissive="#06182c"
              emissiveIntensity={0.8}
            />
          </Sphere>

          {/* Distorted glowing atmosphere */}
          <Sphere ref={atmosphereRef} args={[2.2, 64, 64]}>
            <MeshDistortMaterial
              color="#00CFFF"
              emissive="#00CFFF"
              emissiveIntensity={0.3}
              transparent
              opacity={0.2}
              distort={0.3}
              speed={1.5}
              roughness={0.2}
            />
          </Sphere>
          <pointLight color="#00FF9D" intensity={50} distance={20} position={[2, 3, 4]} />
          <ambientLight color="#00CFFF" intensity={1} />
        </>
      ) : (
        <>
          {/* Wireframe Earth for Light Theme */}
          <Sphere ref={earthRef} args={[2, 64, 64]}>
            <meshStandardMaterial
              color="#0A3D1F"
              emissive="#1A7A4A"
              emissiveIntensity={1.5}
              wireframe={true}
              transparent={true}
              opacity={0.9}
            />
          </Sphere>
          
          <Sphere args={[1.95, 32, 32]}>
             <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
          </Sphere>

          <Sphere ref={atmosphereRef} args={[2.1, 64, 64]}>
            <MeshDistortMaterial
              color="#1A7A4A"
              transparent
              opacity={0.15}
              distort={0.4}
              speed={2}
              roughness={0.2}
            />
          </Sphere>
          <directionalLight color="#1A7A4A" intensity={1} position={[0, 3, 3]} />
          <ambientLight color="#ffffff" intensity={1} />
        </>
      )}
    </group>
  );
}
