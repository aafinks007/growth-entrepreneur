import { Canvas } from '@react-three/fiber';
import { Float } from '@react-three/drei';

const materialProps = {
  color: '#3b82f6', // Your accent blue
  wireframe: true,
  transparent: true,
  opacity: 0.5,
};

function BarChart(props) {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1} {...props}>
      <group>
        <mesh position={[-1.2, -0.5, 0]}>
          <boxGeometry args={[0.8, 1, 0.8]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.8, 2, 0.8]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        <mesh position={[1.2, 0.5, 0]}>
          <boxGeometry args={[0.8, 3, 0.8]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      </group>
    </Float>
  );
}

function Target(props) {
  return (
    <Float speed={2.5} rotationIntensity={1} floatIntensity={1.5} {...props}>
      <group>
        <mesh>
          <torusGeometry args={[1.8, 0.2, 16, 32]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        <mesh>
          <torusGeometry args={[1.0, 0.2, 16, 32]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      </group>
    </Float>
  );
}

function MagnifyingGlass(props) {
  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={1} {...props}>
      <group rotation={[0, 0, -Math.PI / 4]}>
        <mesh position={[0, 1.2, 0]}>
          <torusGeometry args={[1.2, 0.15, 16, 32]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 2, 16]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      </group>
    </Float>
  );
}

function Globe(props) {
  return (
    <Float speed={1.5} rotationIntensity={2} floatIntensity={1} {...props}>
      <mesh>
        <sphereGeometry args={[2, 16, 16]} />
        <meshStandardMaterial color="#3b82f6" wireframe transparent opacity={0.4} />
      </mesh>
    </Float>
  );
}

export default function NetworkBackground() {
  return (
    <div 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: -1, 
        pointerEvents: 'none',
        opacity: 0.8
      }}
    >
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* Positions scattered around the screen */}
        <BarChart position={[-6, 3, -5]} rotation={[0.5, 0.5, 0]} />
        <Target position={[6, 2, -3]} rotation={[0.5, -0.5, 0]} />
        <MagnifyingGlass position={[-5, -4, -4]} rotation={[-0.5, 0.5, 0]} />
        <Globe position={[5, -3, -5]} />
      </Canvas>
    </div>
  );
}
