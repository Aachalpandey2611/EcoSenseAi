import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useSettingsStore } from '@/store/settingsStore';

export default function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const theme = useSettingsStore((state) => state.theme);

  // Generate a procedural noise texture for continents/clouds (since we don't have images)
  const textureData = useMemo(() => {
    const size = 256;
    const data = new Uint8Array(size * size * 4);
    for (let i = 0; i < size * size * 4; i += 4) {
      // Very basic noise to simulate continents
      const val = Math.random() > 0.6 ? 255 : 0;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = 255;
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.needsUpdate = true;
    return tex;
  }, []);

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
          {/* Cyber Eco Dark Earth */}
          <Sphere ref={earthRef} args={[2, 64, 64]}>
            <meshStandardMaterial
              color="#060D16"
              emissive="#00FF9D"
              emissiveIntensity={0.2}
              emissiveMap={textureData}
              wireframe={true}
            />
          </Sphere>
          <Sphere ref={atmosphereRef} args={[2.1, 64, 64]}>
            <MeshDistortMaterial
              color="#00CFFF"
              transparent
              opacity={0.1}
              distort={0.4}
              speed={2}
              roughness={0}
            />
          </Sphere>
          <pointLight color="#00FF9D" intensity={2} distance={10} position={[0, 3, 3]} />
          <ambientLight color="#001833" intensity={0.5} />
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
          
          {/* Solid inner core so the wireframe doesn't look completely hollow/messy */}
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
