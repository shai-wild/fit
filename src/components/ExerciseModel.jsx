import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const SKIN = '#FFB98A';
const SHIRT = '#6366F1';
const SHORTS = '#1E293B';
const SHOE = '#334155';

function createLimbGeometry(length, radius) {
  return new THREE.CapsuleGeometry(radius, length, 8, 16);
}

function StickFigure({ animation, progress }) {
  const group = useRef();
  const timeRef = useRef(0);

  const geo = useMemo(() => ({
    head: new THREE.SphereGeometry(0.22, 16, 16),
    torso: createLimbGeometry(0.6, 0.15),
    upperArm: createLimbGeometry(0.3, 0.07),
    forearm: createLimbGeometry(0.28, 0.06),
    upperLeg: createLimbGeometry(0.35, 0.09),
    lowerLeg: createLimbGeometry(0.32, 0.07),
    hand: new THREE.SphereGeometry(0.07, 8, 8),
    foot: new THREE.BoxGeometry(0.12, 0.06, 0.22),
  }), []);

  const mat = useMemo(() => ({
    skin: new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.6 }),
    shirt: new THREE.MeshStandardMaterial({ color: SHIRT, roughness: 0.5 }),
    shorts: new THREE.MeshStandardMaterial({ color: SHORTS, roughness: 0.5 }),
    shoe: new THREE.MeshStandardMaterial({ color: SHOE, roughness: 0.8 }),
  }), []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (!group.current) return;

    const t = timeRef.current;
    const cycle = Math.sin(t * 2.5) * 0.5 + 0.5; // 0 to 1 smooth cycle

    const body = group.current;
    const [torso, head,
      lUpperArm, lForearm, lHand,
      rUpperArm, rForearm, rHand,
      lUpperLeg, lLowerLeg, lFoot,
      rUpperLeg, rLowerLeg, rFoot
    ] = body.children;

    // Reset transforms
    body.position.set(0, 0, 0);
    body.rotation.set(0, 0, 0);
    torso.rotation.set(0, 0, 0);
    torso.position.set(0, 1.2, 0);
    head.position.set(0, 1.75, 0);
    head.rotation.set(0, 0, 0);

    lUpperArm.position.set(-0.25, 1.5, 0);
    rUpperArm.position.set(0.25, 1.5, 0);
    lForearm.position.set(-0.25, 1.1, 0);
    rForearm.position.set(0.25, 1.1, 0);
    lHand.position.set(-0.25, 0.8, 0);
    rHand.position.set(0.25, 0.8, 0);

    lUpperLeg.position.set(-0.12, 0.6, 0);
    rUpperLeg.position.set(0.12, 0.6, 0);
    lLowerLeg.position.set(-0.12, 0.2, 0);
    rLowerLeg.position.set(0.12, 0.2, 0);
    lFoot.position.set(-0.12, 0.03, 0.04);
    rFoot.position.set(0.12, 0.03, 0.04);

    // Reset rotations
    [lUpperArm, lForearm, rUpperArm, rForearm,
     lUpperLeg, lLowerLeg, rUpperLeg, rLowerLeg].forEach(m => {
      m.rotation.set(0, 0, 0);
    });

    switch (animation) {
      case 'pushup': {
        // Push-up: body horizontal, arms push up and down
        const dip = Math.sin(t * 3) * 0.5 + 0.5;
        const bodyY = 0.4 + dip * 0.25;

        body.rotation.x = -Math.PI / 2 + 0.1;
        body.position.y = bodyY - 0.5;
        body.position.z = 0.3;

        // Arms bend
        lUpperArm.rotation.x = -0.3 + dip * 0.5;
        rUpperArm.rotation.x = -0.3 + dip * 0.5;
        lForearm.rotation.x = -dip * 0.8;
        rForearm.rotation.x = -dip * 0.8;
        break;
      }

      case 'squat': {
        const depth = Math.sin(t * 2.5) * 0.5 + 0.5;
        const squat = depth * 0.7;

        body.position.y = -squat * 0.5;

        lUpperLeg.rotation.x = -squat * 1.2;
        rUpperLeg.rotation.x = -squat * 1.2;
        lLowerLeg.rotation.x = squat * 1.5;
        rLowerLeg.rotation.x = squat * 1.5;

        // Arms forward for balance
        lUpperArm.rotation.x = squat * 1.5;
        rUpperArm.rotation.x = squat * 1.5;
        lForearm.rotation.x = -squat * 0.3;
        rForearm.rotation.x = -squat * 0.3;

        torso.rotation.x = -squat * 0.2;
        break;
      }

      case 'lunge': {
        const step = Math.sin(t * 2) * 0.5 + 0.5;

        body.position.y = -step * 0.3;

        lUpperLeg.rotation.x = step * 1.2;
        lLowerLeg.rotation.x = -step * 1.0;
        rUpperLeg.rotation.x = -step * 0.8;
        rLowerLeg.rotation.x = step * 0.5;

        lUpperArm.rotation.x = -step * 0.3;
        rUpperArm.rotation.x = step * 0.3;

        torso.rotation.x = -step * 0.1;
        break;
      }

      case 'plank': {
        body.rotation.x = -Math.PI / 2 + 0.05;
        body.position.y = -0.6;
        body.position.z = 0.3;

        // Slight breathing motion
        const breathe = Math.sin(t * 1.5) * 0.02;
        body.position.y += breathe;

        lUpperArm.rotation.x = -0.3;
        rUpperArm.rotation.x = -0.3;
        lForearm.rotation.x = -0.5;
        rForearm.rotation.x = -0.5;
        break;
      }

      case 'burpee': {
        const phase = (t * 1.2) % 4;

        if (phase < 1) {
          // Standing to squat
          const p = phase;
          body.position.y = -p * 0.4;
          lUpperLeg.rotation.x = -p * 1.2;
          rUpperLeg.rotation.x = -p * 1.2;
          lLowerLeg.rotation.x = p * 1.5;
          rLowerLeg.rotation.x = p * 1.5;
        } else if (phase < 2) {
          // Squat to plank
          const p = phase - 1;
          body.rotation.x = -p * (Math.PI / 2 - 0.1);
          body.position.y = -0.4 - p * 0.2;
          body.position.z = p * 0.3;
        } else if (phase < 3) {
          // Plank to squat
          const p = phase - 2;
          body.rotation.x = -(1 - p) * (Math.PI / 2 - 0.1);
          body.position.y = -0.6 + p * 0.2;
          body.position.z = (1 - p) * 0.3;
        } else {
          // Jump up
          const p = phase - 3;
          const jump = Math.sin(p * Math.PI) * 0.5;
          body.position.y = jump;
          lUpperArm.rotation.z = -p * 2;
          rUpperArm.rotation.z = p * 2;
        }
        break;
      }

      case 'jumpingjack': {
        const spread = Math.sin(t * 4) * 0.5 + 0.5;

        body.position.y = Math.abs(Math.sin(t * 4)) * 0.1;

        lUpperArm.rotation.z = -spread * 2.5;
        rUpperArm.rotation.z = spread * 2.5;
        lForearm.rotation.z = -spread * 0.3;
        rForearm.rotation.z = spread * 0.3;

        lUpperLeg.rotation.z = -spread * 0.4;
        rUpperLeg.rotation.z = spread * 0.4;
        break;
      }

      case 'mountainclimber': {
        body.rotation.x = -Math.PI / 2 + 0.15;
        body.position.y = -0.5;
        body.position.z = 0.3;

        const legSwitch = Math.sin(t * 5);
        lUpperLeg.rotation.x = legSwitch > 0 ? legSwitch * 1.5 : 0;
        rUpperLeg.rotation.x = legSwitch < 0 ? -legSwitch * 1.5 : 0;
        lLowerLeg.rotation.x = legSwitch > 0 ? -legSwitch * 0.5 : 0;
        rLowerLeg.rotation.x = legSwitch < 0 ? legSwitch * 0.5 : 0;
        break;
      }

      case 'crunch': {
        // Lying on back
        body.rotation.x = Math.PI / 2;
        body.position.y = -0.8;
        body.position.z = -0.3;

        const crunchUp = Math.sin(t * 2.5) * 0.5 + 0.5;
        torso.rotation.x = crunchUp * 0.6;
        head.rotation.x = crunchUp * 0.3;

        lUpperArm.rotation.x = 0.5;
        rUpperArm.rotation.x = 0.5;

        lUpperLeg.rotation.x = 1.0;
        rUpperLeg.rotation.x = 1.0;
        lLowerLeg.rotation.x = -1.2;
        rLowerLeg.rotation.x = -1.2;
        break;
      }

      case 'legraise': {
        body.rotation.x = Math.PI / 2;
        body.position.y = -0.8;
        body.position.z = -0.3;

        const raise = Math.sin(t * 2) * 0.5 + 0.5;
        lUpperLeg.rotation.x = raise * 1.5;
        rUpperLeg.rotation.x = raise * 1.5;
        break;
      }

      case 'highknees': {
        const leftUp = Math.max(0, Math.sin(t * 6));
        const rightUp = Math.max(0, Math.sin(t * 6 + Math.PI));

        body.position.y = (leftUp + rightUp) * 0.05;

        lUpperLeg.rotation.x = leftUp * 1.5;
        lLowerLeg.rotation.x = -leftUp * 1.2;
        rUpperLeg.rotation.x = rightUp * 1.5;
        rLowerLeg.rotation.x = -rightUp * 1.2;

        lUpperArm.rotation.x = rightUp * 1.0;
        rUpperArm.rotation.x = leftUp * 1.0;
        break;
      }

      case 'dip': {
        const dipDown = Math.sin(t * 2.5) * 0.5 + 0.5;

        body.position.y = -dipDown * 0.3;

        lUpperArm.rotation.z = -0.5;
        rUpperArm.rotation.z = 0.5;
        lForearm.rotation.x = -dipDown * 1.2;
        rForearm.rotation.x = -dipDown * 1.2;

        lUpperLeg.rotation.x = 0.3;
        rUpperLeg.rotation.x = 0.3;
        break;
      }

      case 'superman': {
        body.rotation.x = Math.PI / 2;
        body.position.y = -0.8;
        body.position.z = -0.3;

        const lift = Math.sin(t * 2) * 0.5 + 0.5;
        lUpperArm.rotation.x = Math.PI - lift * 0.3;
        rUpperArm.rotation.x = Math.PI - lift * 0.3;
        lUpperLeg.rotation.x = -lift * 0.4;
        rUpperLeg.rotation.x = -lift * 0.4;
        head.rotation.x = -lift * 0.3;
        break;
      }

      case 'calfraise': {
        const raise = Math.sin(t * 3) * 0.5 + 0.5;
        body.position.y = raise * 0.15;

        lFoot.rotation.x = -raise * 0.5;
        rFoot.rotation.x = -raise * 0.5;
        break;
      }

      default: {
        // Idle breathing
        const breathe = Math.sin(t * 1.5) * 0.02;
        body.position.y = breathe;
        lUpperArm.rotation.z = Math.sin(t * 0.8) * 0.05 - 0.05;
        rUpperArm.rotation.z = -Math.sin(t * 0.8) * 0.05 + 0.05;
      }
    }

    // Gentle rotation for better 3D effect
    body.rotation.y = Math.sin(t * 0.3) * 0.1;
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* Torso */}
      <mesh geometry={geo.torso} material={mat.shirt} />
      {/* Head */}
      <mesh geometry={geo.head} material={mat.skin} />

      {/* Left arm */}
      <mesh geometry={geo.upperArm} material={mat.shirt} />
      <mesh geometry={geo.forearm} material={mat.skin} />
      <mesh geometry={geo.hand} material={mat.skin} />

      {/* Right arm */}
      <mesh geometry={geo.upperArm} material={mat.shirt} />
      <mesh geometry={geo.forearm} material={mat.skin} />
      <mesh geometry={geo.hand} material={mat.skin} />

      {/* Left leg */}
      <mesh geometry={geo.upperLeg} material={mat.shorts} />
      <mesh geometry={geo.lowerLeg} material={mat.skin} />
      <mesh geometry={geo.foot} material={mat.shoe} />

      {/* Right leg */}
      <mesh geometry={geo.upperLeg} material={mat.shorts} />
      <mesh geometry={geo.lowerLeg} material={mat.skin} />
      <mesh geometry={geo.foot} material={mat.shoe} />
    </group>
  );
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <circleGeometry args={[2, 32]} />
      <meshStandardMaterial
        color="#1a1a2e"
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

function Particles() {
  const particles = useRef();
  const count = 30;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 1] = Math.random() * 4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (!particles.current) return;
    const pos = particles.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      pos.array[i * 3 + 1] += delta * 0.3;
      if (pos.array[i * 3 + 1] > 4) pos.array[i * 3 + 1] = -1;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#6366F1"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

export default function ExerciseModel({ animation = 'idle', style }) {
  return (
    <div style={{
      width: '100%',
      height: 280,
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      background: 'radial-gradient(ellipse at center, #1a1a3e 0%, #0F172A 100%)',
      ...style,
    }}>
      <Canvas
        camera={{ position: [0, 1.2, 3.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 5, 3]} intensity={0.8} color="#fff" />
        <directionalLight position={[-2, 3, -2]} intensity={0.3} color="#818CF8" />
        <pointLight position={[0, 2, 2]} intensity={0.5} color="#EC4899" />

        <StickFigure animation={animation} />
        <Floor />
        <Particles />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 6}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}
