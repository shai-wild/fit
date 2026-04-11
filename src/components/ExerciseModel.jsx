import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// Futuristic color palette
const SKIN = '#D4A574';
const SUIT = '#4338CA';
const SUIT_DARK = '#1E1B4B';
const SHOE_COLOR = '#0F172A';
const GLOW_CYAN = '#22D3EE';
const GLOW_PURPLE = '#A78BFA';

function createLimbGeometry(length, radius) {
  return new THREE.CapsuleGeometry(radius, length, 8, 16);
}

// Smooth easing for natural-looking motion
function smoothstep(x) {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
}

// Sine-based cycle with easing, returns 0->1->0 smoothly
function easedCycle(time, speed) {
  const raw = Math.sin(time * speed) * 0.5 + 0.5;
  return smoothstep(raw);
}

function StickFigure({ animation }) {
  const bodyRef = useRef();
  const spineRef = useRef();
  const headRef = useRef();
  const lShoulderRef = useRef();
  const rShoulderRef = useRef();
  const lElbowRef = useRef();
  const rElbowRef = useRef();
  const lHipRef = useRef();
  const rHipRef = useRef();
  const lKneeRef = useRef();
  const rKneeRef = useRef();
  const timeRef = useRef(0);

  const geo = useMemo(() => ({
    head: new THREE.SphereGeometry(0.22, 32, 32),
    torso: createLimbGeometry(0.6, 0.15),
    upperArm: createLimbGeometry(0.28, 0.07),
    forearm: createLimbGeometry(0.26, 0.06),
    upperLeg: createLimbGeometry(0.33, 0.09),
    lowerLeg: createLimbGeometry(0.30, 0.07),
    hand: new THREE.SphereGeometry(0.07, 12, 12),
    foot: new THREE.BoxGeometry(0.12, 0.06, 0.22),
    joint: new THREE.SphereGeometry(0.035, 12, 12),
    visor: new THREE.BoxGeometry(0.32, 0.055, 0.04),
  }), []);

  const mat = useMemo(() => ({
    skin: new THREE.MeshPhysicalMaterial({
      color: SKIN,
      roughness: 0.4,
      clearcoat: 0.3,
      clearcoatRoughness: 0.4,
    }),
    suit: new THREE.MeshPhysicalMaterial({
      color: SUIT,
      roughness: 0.2,
      metalness: 0.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      emissive: new THREE.Color(SUIT),
      emissiveIntensity: 0.15,
    }),
    shorts: new THREE.MeshPhysicalMaterial({
      color: SUIT_DARK,
      roughness: 0.3,
      metalness: 0.3,
      clearcoat: 0.5,
    }),
    shoe: new THREE.MeshPhysicalMaterial({
      color: SHOE_COLOR,
      roughness: 0.4,
      metalness: 0.2,
      clearcoat: 0.4,
    }),
    jointGlow: new THREE.MeshBasicMaterial({
      color: new THREE.Color(GLOW_CYAN).multiplyScalar(2),
      transparent: true,
      opacity: 0.9,
      toneMapped: false,
    }),
    visor: new THREE.MeshBasicMaterial({
      color: new THREE.Color(GLOW_CYAN).multiplyScalar(1.5),
      transparent: true,
      opacity: 0.7,
      toneMapped: false,
    }),
  }), []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;

    const body = bodyRef.current;
    const spine = spineRef.current;
    const head = headRef.current;
    const lShoulder = lShoulderRef.current;
    const rShoulder = rShoulderRef.current;
    const lElbow = lElbowRef.current;
    const rElbow = rElbowRef.current;
    const lHip = lHipRef.current;
    const rHip = rHipRef.current;
    const lKnee = lKneeRef.current;
    const rKnee = rKneeRef.current;

    if (!body || !spine || !head || !lShoulder || !rShoulder ||
        !lElbow || !rElbow || !lHip || !rHip || !lKnee || !rKnee) return;

    // Reset all joint rotations each frame
    body.position.set(0, 0, 0);
    body.rotation.set(0, 0, 0);
    spine.rotation.set(0, 0, 0);
    head.rotation.set(0, 0, 0);
    lShoulder.rotation.set(0, 0, -0.05);
    rShoulder.rotation.set(0, 0, 0.05);
    lElbow.rotation.set(0, 0, 0);
    rElbow.rotation.set(0, 0, 0);
    lHip.rotation.set(0, 0, 0);
    rHip.rotation.set(0, 0, 0);
    lKnee.rotation.set(0, 0, 0);
    rKnee.rotation.set(0, 0, 0);

    const isHorizontal = ['pushup', 'plank', 'mountainclimber', 'crunch', 'legraise', 'superman'].includes(animation);

    switch (animation) {

      // --- PUSH-UP ---
      case 'pushup': {
        const d = easedCycle(t, 1.4);

        body.rotation.x = -Math.PI / 2 + 0.05;
        body.position.z = 0.5;

        lShoulder.rotation.x = Math.PI / 2 - 0.15;
        rShoulder.rotation.x = Math.PI / 2 - 0.15;
        lShoulder.rotation.z = -0.2;
        rShoulder.rotation.z = 0.2;

        lElbow.rotation.x = d * 1.4;
        rElbow.rotation.x = d * 1.4;

        body.position.y = -0.5 - d * 0.2;

        lHip.rotation.x = 0.03;
        rHip.rotation.x = 0.03;

        head.rotation.x = 0.25;
        break;
      }

      // --- SQUAT ---
      case 'squat': {
        const d = easedCycle(t, 1.3);

        body.position.y = -d * 0.48;

        lHip.rotation.x = -d * 1.5;
        rHip.rotation.x = -d * 1.5;

        lKnee.rotation.x = d * 2.0;
        rKnee.rotation.x = d * 2.0;

        spine.rotation.x = -d * 0.3;

        lShoulder.rotation.x = d * 1.5;
        rShoulder.rotation.x = d * 1.5;
        lShoulder.rotation.z = -0.05;
        rShoulder.rotation.z = 0.05;
        lElbow.rotation.x = -d * 0.3;
        rElbow.rotation.x = -d * 0.3;

        break;
      }

      // --- LUNGE ---
      case 'lunge': {
        const d = easedCycle(t, 1.1);

        body.position.y = -d * 0.25;

        lHip.rotation.x = -d * 0.85;
        lKnee.rotation.x = d * 1.0;

        rHip.rotation.x = d * 0.5;
        rKnee.rotation.x = d * 1.0;

        spine.rotation.x = -d * 0.08;

        lShoulder.rotation.x = d * 0.15;
        rShoulder.rotation.x = -d * 0.15;
        lShoulder.rotation.z = -0.15;
        rShoulder.rotation.z = 0.15;
        lElbow.rotation.x = -d * 0.6;
        rElbow.rotation.x = -d * 0.6;

        break;
      }

      // --- PLANK ---
      case 'plank': {
        body.rotation.x = -Math.PI / 2 + 0.04;
        body.position.y = -0.52;
        body.position.z = 0.4;

        lShoulder.rotation.x = Math.PI / 2 - 0.3;
        rShoulder.rotation.x = Math.PI / 2 - 0.3;
        lShoulder.rotation.z = -0.1;
        rShoulder.rotation.z = 0.1;
        lElbow.rotation.x = 1.4;
        rElbow.rotation.x = 1.4;

        const breathe = Math.sin(t * 1.5) * 0.012;
        body.position.y += breathe;

        head.rotation.x = 0.3;
        lHip.rotation.x = 0.02;
        rHip.rotation.x = 0.02;
        break;
      }

      // --- BURPEE (4-phase) ---
      case 'burpee': {
        const phase = (t * 0.85) % 4;

        if (phase < 1) {
          const p = smoothstep(phase);
          body.position.y = -p * 0.48;
          lHip.rotation.x = -p * 1.5;
          rHip.rotation.x = -p * 1.5;
          lKnee.rotation.x = p * 2.0;
          rKnee.rotation.x = p * 2.0;
          spine.rotation.x = -p * 0.3;
          lShoulder.rotation.x = p * 1.0;
          rShoulder.rotation.x = p * 1.0;
        } else if (phase < 2) {
          const p = smoothstep(phase - 1);
          body.rotation.x = -p * (Math.PI / 2 - 0.05);
          body.position.y = -0.48 + p * 0.02;
          body.position.z = p * 0.5;

          const sq = 1 - p;
          lHip.rotation.x = -sq * 1.5 + p * 0.03;
          rHip.rotation.x = -sq * 1.5 + p * 0.03;
          lKnee.rotation.x = sq * 2.0;
          rKnee.rotation.x = sq * 2.0;

          lShoulder.rotation.x = sq * 1.0 + p * (Math.PI / 2 - 0.15);
          rShoulder.rotation.x = sq * 1.0 + p * (Math.PI / 2 - 0.15);
          lShoulder.rotation.z = -p * 0.2;
          rShoulder.rotation.z = p * 0.2;
          spine.rotation.x = -sq * 0.3;
          head.rotation.x = p * 0.25;
        } else if (phase < 3) {
          const p = smoothstep(phase - 2);
          body.rotation.x = -(1 - p) * (Math.PI / 2 - 0.05);
          body.position.y = -0.46 - p * 0.02;
          body.position.z = (1 - p) * 0.5;

          lHip.rotation.x = -p * 1.5;
          rHip.rotation.x = -p * 1.5;
          lKnee.rotation.x = p * 2.0;
          rKnee.rotation.x = p * 2.0;
          spine.rotation.x = -p * 0.3;

          lShoulder.rotation.x = (1 - p) * (Math.PI / 2 - 0.15) + p * 1.0;
          rShoulder.rotation.x = (1 - p) * (Math.PI / 2 - 0.15) + p * 1.0;
          lShoulder.rotation.z = -(1 - p) * 0.2;
          rShoulder.rotation.z = (1 - p) * 0.2;
          head.rotation.x = (1 - p) * 0.25;
        } else {
          const p = phase - 3;
          const jumpArc = Math.sin(p * Math.PI);
          body.position.y = jumpArc * 0.5;

          lShoulder.rotation.x = jumpArc * 2.8;
          rShoulder.rotation.x = jumpArc * 2.8;
          lShoulder.rotation.z = -jumpArc * 0.3;
          rShoulder.rotation.z = jumpArc * 0.3;

          lHip.rotation.x = -jumpArc * 0.3;
          rHip.rotation.x = -jumpArc * 0.3;
          lKnee.rotation.x = jumpArc * 0.4;
          rKnee.rotation.x = jumpArc * 0.4;

          if (p > 0.85) {
            const land = (p - 0.85) / 0.15;
            lHip.rotation.x = -land * 0.4;
            rHip.rotation.x = -land * 0.4;
            lKnee.rotation.x = land * 0.6;
            rKnee.rotation.x = land * 0.6;
          }
        }
        break;
      }

      // --- JUMPING JACK ---
      case 'jumpingjack': {
        const d = easedCycle(t, 3.0);
        const bounce = Math.abs(Math.sin(t * 3.0)) * 0.08;

        body.position.y = bounce;

        lShoulder.rotation.z = -0.05 - d * 2.9;
        rShoulder.rotation.z = 0.05 + d * 2.9;
        lShoulder.rotation.x = d * 0.15;
        rShoulder.rotation.x = d * 0.15;
        lElbow.rotation.x = -d * 0.1;
        rElbow.rotation.x = -d * 0.1;

        lHip.rotation.z = -d * 0.45;
        rHip.rotation.z = d * 0.45;
        break;
      }

      // --- MOUNTAIN CLIMBER ---
      case 'mountainclimber': {
        body.rotation.x = -Math.PI / 2 + 0.1;
        body.position.y = -0.5;
        body.position.z = 0.45;

        const leftDrive = Math.max(0, Math.sin(t * 5.0));
        const rightDrive = Math.max(0, Math.sin(t * 5.0 + Math.PI));

        lShoulder.rotation.x = Math.PI / 2 - 0.15;
        rShoulder.rotation.x = Math.PI / 2 - 0.15;
        lShoulder.rotation.z = -0.15;
        rShoulder.rotation.z = 0.15;

        lHip.rotation.x = leftDrive * 1.8;
        lKnee.rotation.x = -leftDrive * 1.0;
        rHip.rotation.x = rightDrive * 1.8;
        rKnee.rotation.x = -rightDrive * 1.0;

        head.rotation.x = 0.2;
        break;
      }

      // --- CRUNCH ---
      case 'crunch': {
        body.rotation.x = Math.PI / 2;
        body.position.y = -0.85;
        body.position.z = -0.3;

        const d = easedCycle(t, 1.4);

        spine.rotation.x = d * 0.65;
        head.rotation.x = d * 0.2;

        lShoulder.rotation.x = -0.6;
        rShoulder.rotation.x = -0.6;
        lShoulder.rotation.z = -0.7;
        rShoulder.rotation.z = 0.7;
        lElbow.rotation.x = -1.6;
        rElbow.rotation.x = -1.6;

        lHip.rotation.x = 0.9;
        rHip.rotation.x = 0.9;
        lKnee.rotation.x = -1.4;
        rKnee.rotation.x = -1.4;
        break;
      }

      // --- LEG RAISE ---
      case 'legraise': {
        body.rotation.x = Math.PI / 2;
        body.position.y = -0.85;
        body.position.z = -0.3;

        const d = easedCycle(t, 1.2);

        lHip.rotation.x = d * 1.5;
        rHip.rotation.x = d * 1.5;
        lKnee.rotation.x = -d * 0.08;
        rKnee.rotation.x = -d * 0.08;

        lShoulder.rotation.z = -0.2;
        rShoulder.rotation.z = 0.2;
        break;
      }

      // --- HIGH KNEES ---
      case 'highknees': {
        const leftUp = Math.max(0, Math.sin(t * 5.5));
        const rightUp = Math.max(0, Math.sin(t * 5.5 + Math.PI));
        const bounce = (leftUp + rightUp) * 0.04;

        body.position.y = bounce;

        lHip.rotation.x = -leftUp * 1.6;
        lKnee.rotation.x = leftUp * 1.9;
        rHip.rotation.x = -rightUp * 1.6;
        rKnee.rotation.x = rightUp * 1.9;

        rShoulder.rotation.x = leftUp * 1.2;
        rElbow.rotation.x = -leftUp * 1.3;
        lShoulder.rotation.x = rightUp * 1.2;
        lElbow.rotation.x = -rightUp * 1.3;

        spine.rotation.x = -0.06;
        break;
      }

      // --- TRICEP DIP ---
      case 'dip': {
        const d = easedCycle(t, 1.3);

        body.position.y = -d * 0.35;

        lShoulder.rotation.x = -0.4;
        rShoulder.rotation.x = -0.4;
        lShoulder.rotation.z = -0.3;
        rShoulder.rotation.z = 0.3;

        lElbow.rotation.x = d * 1.5;
        rElbow.rotation.x = d * 1.5;

        lHip.rotation.x = -0.5;
        rHip.rotation.x = -0.5;
        lKnee.rotation.x = 0.5;
        rKnee.rotation.x = 0.5;

        spine.rotation.x = d * 0.1;
        break;
      }

      // --- SUPERMAN ---
      case 'superman': {
        body.rotation.x = Math.PI / 2;
        body.position.y = -0.85;
        body.position.z = -0.3;

        const d = easedCycle(t, 1.2);

        lShoulder.rotation.x = Math.PI - 0.3 + d * 0.4;
        rShoulder.rotation.x = Math.PI - 0.3 + d * 0.4;

        spine.rotation.x = -d * 0.35;
        head.rotation.x = -d * 0.3;

        lHip.rotation.x = -d * 0.5;
        rHip.rotation.x = -d * 0.5;
        break;
      }

      // --- CALF RAISE ---
      case 'calfraise': {
        const d = easedCycle(t, 1.5);

        body.position.y = d * 0.18;

        lShoulder.rotation.z = -0.15;
        rShoulder.rotation.z = 0.15;
        lShoulder.rotation.x = d * 0.1;
        rShoulder.rotation.x = d * 0.1;
        break;
      }

      // --- IDLE ---
      default: {
        const breathe = Math.sin(t * 1.5) * 0.01;
        body.position.y = breathe;
        lShoulder.rotation.z = -0.08 + Math.sin(t * 0.8) * 0.03;
        rShoulder.rotation.z = 0.08 - Math.sin(t * 0.8) * 0.03;
      }
    }

    // Gentle rotation for 3D depth perception
    if (isHorizontal) {
      body.rotation.y = 0.4 + Math.sin(t * 0.25) * 0.12;
    } else {
      body.rotation.y = Math.sin(t * 0.3) * 0.18;
    }
  });

  return (
    <group ref={bodyRef}>
      {/* Spine: upper body pivot at pelvis level */}
      <group ref={spineRef} position={[0, 0.88, 0]}>
        {/* Torso */}
        <mesh geometry={geo.torso} material={mat.suit} position={[0, 0.33, 0]} />

        {/* Head */}
        <group ref={headRef} position={[0, 0.87, 0]}>
          <mesh geometry={geo.head} material={mat.skin} />
          {/* Futuristic visor */}
          <mesh geometry={geo.visor} material={mat.visor} position={[0, 0.02, 0.18]} />
        </group>

        {/* Left Arm */}
        <group ref={lShoulderRef} position={[-0.23, 0.62, 0]}>
          <mesh geometry={geo.joint} material={mat.jointGlow} />
          <mesh geometry={geo.upperArm} material={mat.suit} position={[0, -0.2, 0]} />
          <group ref={lElbowRef} position={[0, -0.4, 0]}>
            <mesh geometry={geo.joint} material={mat.jointGlow} />
            <mesh geometry={geo.forearm} material={mat.skin} position={[0, -0.18, 0]} />
            <mesh geometry={geo.hand} material={mat.skin} position={[0, -0.36, 0]} />
          </group>
        </group>

        {/* Right Arm */}
        <group ref={rShoulderRef} position={[0.23, 0.62, 0]}>
          <mesh geometry={geo.joint} material={mat.jointGlow} />
          <mesh geometry={geo.upperArm} material={mat.suit} position={[0, -0.2, 0]} />
          <group ref={rElbowRef} position={[0, -0.4, 0]}>
            <mesh geometry={geo.joint} material={mat.jointGlow} />
            <mesh geometry={geo.forearm} material={mat.skin} position={[0, -0.18, 0]} />
            <mesh geometry={geo.hand} material={mat.skin} position={[0, -0.36, 0]} />
          </group>
        </group>
      </group>

      {/* Left Leg */}
      <group ref={lHipRef} position={[-0.11, 0.88, 0]}>
        <mesh geometry={geo.joint} material={mat.jointGlow} />
        <mesh geometry={geo.upperLeg} material={mat.shorts} position={[0, -0.22, 0]} />
        <group ref={lKneeRef} position={[0, -0.44, 0]}>
          <mesh geometry={geo.joint} material={mat.jointGlow} />
          <mesh geometry={geo.lowerLeg} material={mat.skin} position={[0, -0.2, 0]} />
          <mesh geometry={geo.foot} material={mat.shoe} position={[0, -0.4, 0.04]} />
        </group>
      </group>

      {/* Right Leg */}
      <group ref={rHipRef} position={[0.11, 0.88, 0]}>
        <mesh geometry={geo.joint} material={mat.jointGlow} />
        <mesh geometry={geo.upperLeg} material={mat.shorts} position={[0, -0.22, 0]} />
        <group ref={rKneeRef} position={[0, -0.44, 0]}>
          <mesh geometry={geo.joint} material={mat.jointGlow} />
          <mesh geometry={geo.lowerLeg} material={mat.skin} position={[0, -0.2, 0]} />
          <mesh geometry={geo.foot} material={mat.shoe} position={[0, -0.4, 0.04]} />
        </group>
      </group>
    </group>
  );
}

function Floor() {
  const pulseRef = useRef();

  useFrame((state) => {
    if (pulseRef.current) {
      pulseRef.current.material.opacity = 0.28 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const rings = [0.6, 1.0, 1.5, 2.0, 2.5];
  const glowColor = new THREE.Color(GLOW_CYAN).multiplyScalar(1.5);

  return (
    <group>
      {/* Dark reflective base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[3, 64]} />
        <meshStandardMaterial color="#06060f" roughness={0.15} metalness={0.85} />
      </mesh>

      {/* Concentric glow rings */}
      {rings.map((r, i) => (
        <mesh
          key={i}
          ref={i === 0 ? pulseRef : undefined}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.015, 0]}
        >
          <ringGeometry args={[r - 0.008, r + 0.008, 128]} />
          <meshBasicMaterial
            color={glowColor}
            transparent
            opacity={0.3 - i * 0.05}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

function EnergyRings() {
  const ring1 = useRef();
  const ring2 = useRef();

  const mat1 = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(GLOW_CYAN).multiplyScalar(2),
    toneMapped: false,
    transparent: true,
    opacity: 0.45,
  }), []);

  const mat2 = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(GLOW_PURPLE).multiplyScalar(1.5),
    toneMapped: false,
    transparent: true,
    opacity: 0.3,
  }), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring1.current) {
      ring1.current.rotation.y = t * 0.5;
      ring1.current.rotation.x = Math.sin(t * 0.3) * 0.25;
    }
    if (ring2.current) {
      ring2.current.rotation.y = -t * 0.35;
      ring2.current.rotation.z = Math.cos(t * 0.25) * 0.2;
    }
  });

  return (
    <group position={[0, 1.0, 0]}>
      <mesh ref={ring1}>
        <torusGeometry args={[0.7, 0.006, 8, 128]} />
        <primitive object={mat1} attach="material" />
      </mesh>
      <mesh ref={ring2}>
        <torusGeometry args={[0.85, 0.004, 8, 128]} />
        <primitive object={mat2} attach="material" />
      </mesh>
    </group>
  );
}

function Particles() {
  const particles = useRef();
  const count = 60;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = Math.random() * 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (!particles.current) return;
    const pos = particles.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      pos.array[i * 3 + 1] += delta * (0.15 + Math.sin(i) * 0.1);
      if (pos.array[i * 3 + 1] > 5) pos.array[i * 3 + 1] = -1;
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
        size={0.05}
        color={new THREE.Color(GLOW_CYAN).multiplyScalar(1.5)}
        transparent
        opacity={0.6}
        sizeAttenuation
        toneMapped={false}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
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
      background: 'radial-gradient(ellipse at center, #12122a 0%, #080810 100%)',
      ...style,
    }}>
      <Canvas
        camera={{ position: [0, 1.2, 3.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      >
        {/* Lighting rig */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[3, 5, 3]} intensity={1.0} color="#ffffff" />
        <directionalLight position={[-3, 2, -4]} intensity={0.5} color={GLOW_CYAN} />
        <pointLight position={[2, 2, 1]} intensity={0.7} color="#EC4899" />
        <pointLight position={[-2, 1, 3]} intensity={0.4} color={GLOW_PURPLE} />

        <StickFigure animation={animation} />
        <Floor />
        <EnergyRings />
        <Particles />

        {/* Post-processing bloom for glow effects */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.5}
            luminanceSmoothing={0.4}
            intensity={1.2}
            mipmapBlur
          />
        </EffectComposer>

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
