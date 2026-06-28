import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSettingsStore } from '@/store/settingsStore';

interface ParticleBackdropProps {
  isThinking?: boolean;
}

export default function ParticleBackdrop({ isThinking = false }: ParticleBackdropProps) {
  const theme = useSettingsStore((state) => state.theme);
  
  // Theme specifics
  const count = theme === 'dark' ? 800 : 600;
  const color = theme === 'dark' ? '#00CFFF' : '#E8A020';
  const size = theme === 'dark' ? 0.03 : 0.02;

  const mesh = useRef<THREE.InstancedMesh>(null);
  const light = useRef<THREE.PointLight>(null);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 800; i++) { // Max count
      const time = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      // In dark mode, sphere formation. In light mode, spread out volume.
      const isDark = theme === 'dark';
      
      const radius = isDark ? 8 : 15;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      const x = isDark ? radius * Math.sin(phi) * Math.cos(theta) : Math.random() * 30 - 15;
      const y = isDark ? radius * Math.sin(phi) * Math.sin(theta) : Math.random() * 30 - 15;
      const z = isDark ? radius * Math.cos(phi) : Math.random() * 30 - 15;

      temp.push({ time, factor, speed, x, y, z });
    }
    return temp;
  }, [theme]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (mesh.current) {
      particles.slice(0, count).forEach((particle, i) => {
        let { time, factor, speed, x, y, z } = particle;
        time = particle.time += speed / 2;
        
        if (theme === 'dark') {
          // Cyber Eco - precise, pulsing sphere
          if (isThinking) {
            x *= 0.98;
            y *= 0.98;
            z *= 0.98;
            particle.speed = speed * 1.05;
          } else {
            particle.speed = Math.max(0.01, speed * 0.95);
          }
        } else {
          // Botanical Premium - organic drift
          if (isThinking) {
            x += Math.sin(time) * 0.1;
            y += Math.cos(time) * 0.1;
          }
        }

        const currentX = x + Math.cos(time) * (isThinking ? 1 : 2);
        const currentY = y + Math.sin(time) * factor / 10;
        const currentZ = z + Math.sin(time) * (isThinking ? 1 : 2);

        dummy.position.set(currentX, currentY, currentZ);
        dummy.scale.setScalar(isThinking && theme === 'dark' ? 1.5 : 1);
        dummy.updateMatrix();
        
        mesh.current!.setMatrixAt(i, dummy.matrix);
      });
      mesh.current.instanceMatrix.needsUpdate = true;
    }
    
    if (light.current) {
      light.current.intensity = isThinking ? 2 + Math.sin(Date.now() / 200) : 1;
    }
  });

  return (
    <>
      <pointLight ref={light} distance={40} intensity={1} color={color} />
      <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
        <dodecahedronGeometry args={[size, 0]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </instancedMesh>
    </>
  );
}
