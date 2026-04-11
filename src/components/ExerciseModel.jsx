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

// Smooth easing for natural-looking motion
function smoothstep(x) {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
}

// Sine-based cycle with easing, returns 0→1→0 smoothly
function easedCycle(time, speed) {
  const raw = Math.sin(time * speed) * 0.5 + 0.5;
  return smoothstep(raw);
}

// Linear interpolation
function lerp(a, b, t) {
  return a + (b - a) * t;
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
    head: new THREE.SphereGeometry(0.22, 16, 16),
    torso: createLimbGeometry(0.6, 0.15),
    upperArm: createLimbGeometry(0.28, 0.07),
    forearm: createLimbGeometry(0.26, 0.06),
    upperLeg: createLimbGeometry(0.33, 0.09),
    lowerLeg: createLimbGeometry(0.30, 0.07),
    hand: new THREE.SphereGeometry(0.07, 8, 8),
    foot: new THREE.BoxGeometry(0.12, 0.06, 0.22),
  }), []);

  const mat = useMemo(() => ({
    skin: new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.6 }),
    shirt: new THREE.MeshStandardMaterial({ color: SHIRT, roughness: 0.5, metalness: 0.1 }),
    shorts: new THREE.MeshStandardMaterial({ color: SHORTS, roughness: 0.5 }),
    shoe: new THREE.MeshStandardMaterial({ color: SHOE, roughness: 0.8 }),
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

      // ─── PUSH-UP ───
      case 'pushup': {
        const d = easedCycle(t, 1.4);

        // Body horizontal, face down
        body.rotation.x = -Math.PI / 2 + 0.05;
        body.position.z = 0.5;

        // Arms reach down to ground, perpendicular to body
        lShoulder.rotation.x = Math.PI / 2 - 0.15;
        rShoulder.rotation.x = Math.PI / 2 - 0.15;
        lShoulder.rotation.z = -0.2;
        rShoulder.rotation.z = 0.2;

        // Elbows bend to lower body, straighten to push up
        lElbow.rotation.x = d * 1.4;
        rElbow.rotation.x = d * 1.4;

        // Body lowers as elbows bend
        body.position.y = -0.5 - d * 0.2;

        // Rigid legs
        lHip.rotation.x = 0.03;
        rHip.rotation.x = 0.03;

        // Head looks slightly forward
        head.rotation.x = 0.25;
        break;
      }

      // ─── SQUAT ───
      case 'squat': {
        const d = easedCycle(t, 1.3);

        // Body lowers into squat
        body.position.y = -d * 0.48;

        // Hip flexion — thighs rotate forward
        lHip.rotation.x = -d * 1.5;
        rHip.rotation.x = -d * 1.5;

        // Knee flexion — shins fold back under thighs
        lKnee.rotation.x = d * 2.0;
        rKnee.rotation.x = d * 2.0;

        // Torso leans forward for balance
        spine.rotation.x = -d * 0.3;

        // Arms reach forward as counterbalance
        lShoulder.rotation.x = d * 1.5;
        rShoulder.rotation.x = d * 1.5;
        lShoulder.rotation.z = -0.05;
        rShoulder.rotation.z = 0.05;
        lElbow.rotation.x = -d * 0.3;
        rElbow.rotation.x = -d * 0.3;

        break;
      }

      // ─── LUNGE ───
      case 'lunge': {
        const d = easedCycle(t, 1.1);

        body.position.y = -d * 0.25;

        // Front leg (left): hip flexed, knee bent, shin near vertical
        lHip.rotation.x = -d * 0.85;
        lKnee.rotation.x = d * 1.0;

        // Back leg (right): hip extended, knee drops toward ground
        rHip.rotation.x = d * 0.5;
        rKnee.rotation.x = d * 1.0;

        // Upright torso
        spine.rotation.x = -d * 0.08;

        // Arms relaxed at sides with slight counter-motion
        lShoulder.rotation.x = d * 0.15;
        rShoulder.rotation.x = -d * 0.15;
        lShoulder.rotation.z = -0.15;
        rShoulder.rotation.z = 0.15;
        lElbow.rotation.x = -d * 0.6;
        rElbow.rotation.x = -d * 0.6;

        break;
      }

      // ─── PLANK ───
      case 'plank': {
        body.rotation.x = -Math.PI / 2 + 0.04;
        body.position.y = -0.52;
        body.position.z = 0.4;

        // Forearm plank: elbows at 90 degrees, forearms on ground
        lShoulder.rotation.x = Math.PI / 2 - 0.3;
        rShoulder.rotation.x = Math.PI / 2 - 0.3;
        lShoulder.rotation.z = -0.1;
        rShoulder.rotation.z = 0.1;
        lElbow.rotation.x = 1.4;
        rElbow.rotation.x = 1.4;

        // Subtle breathing
        const breathe = Math.sin(t * 1.5) * 0.012;
        body.position.y += breathe;

        head.rotation.x = 0.3;
        lHip.rotation.x = 0.02;
        rHip.rotation.x = 0.02;
        break;
      }

      // ─── BURPEE (4-phase) ───
      case 'burpee': {
        const phase = (t * 0.85) % 4;

        if (phase < 1) {
          // Phase 1: Standing → Deep squat
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
          // Phase 2: Squat → Plank (kick legs back)
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
          // Phase 3: Plank → Squat (jump feet forward)
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
          // Phase 4: Explosive jump up
          const p = phase - 3;
          const jumpArc = Math.sin(p * Math.PI);
          body.position.y = jumpArc * 0.5;

          // Arms sweep overhead
          lShoulder.rotation.x = jumpArc * 2.8;
          rShoulder.rotation.x = jumpArc * 2.8;
          lShoulder.rotation.z = -jumpArc * 0.3;
          rShoulder.rotation.z = jumpArc * 0.3;

          // Slight leg tuck at peak
          lHip.rotation.x = -jumpArc * 0.3;
          rHip.rotation.x = -jumpArc * 0.3;
          lKnee.rotation.x = jumpArc * 0.4;
          rKnee.rotation.x = jumpArc * 0.4;

          // Landing absorption
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

      // ─── JUMPING JACK ───
      case 'jumpingjack': {
        const d = easedCycle(t, 3.0);
        const bounce = Math.abs(Math.sin(t * 3.0)) * 0.08;

        body.position.y = bounce;

        // Arms sweep from sides to overhead in a wide arc
        lShoulder.rotation.z = -0.05 - d * 2.9;
        rShoulder.rotation.z = 0.05 + d * 2.9;
        lShoulder.rotation.x = d * 0.15;
        rShoulder.rotation.x = d * 0.15;
        lElbow.rotation.x = -d * 0.1;
        rElbow.rotation.x = -d * 0.1;

        // Legs spread apart
        lHip.rotation.z = -d * 0.45;
        rHip.rotation.z = d * 0.45;
        break;
      }

      // ─── MOUNTAIN CLIMBER ───
      case 'mountainclimber': {
        body.rotation.x = -Math.PI / 2 + 0.1;
        body.position.y = -0.5;
        body.position.z = 0.45;

        // Fast alternating knee drives
        const leftDrive = Math.max(0, Math.sin(t * 5.0));
        const rightDrive = Math.max(0, Math.sin(t * 5.0 + Math.PI));

        // Straight arm plank base
        lShoulder.rotation.x = Math.PI / 2 - 0.15;
        rShoulder.rotation.x = Math.PI / 2 - 0.15;
        lShoulder.rotation.z = -0.15;
        rShoulder.rotation.z = 0.15;

        // Explosive knee drives toward chest
        lHip.rotation.x = leftDrive * 1.8;
        lKnee.rotation.x = -leftDrive * 1.0;
        rHip.rotation.x = rightDrive * 1.8;
        rKnee.rotation.x = -rightDrive * 1.0;

        head.rotation.x = 0.2;
        break;
      }

      // ─── CRUNCH ───
      case 'crunch': {
        // Lying on back
        body.rotation.x = Math.PI / 2;
        body.position.y = -0.85;
        body.position.z = -0.3;

        const d = easedCycle(t, 1.4);

        // Spinal curl upward
        spine.rotation.x = d * 0.65;
        head.rotation.x = d * 0.2;

        // Hands behind head, elbows wide
        lShoulder.rotation.x = -0.6;
        rShoulder.rotation.x = -0.6;
        lShoulder.rotation.z = -0.7;
        rShoulder.rotation.z = 0.7;
        lElbow.rotation.x = -1.6;
        rElbow.rotation.x = -1.6;

        // Knees bent, feet flat on ground
        lHip.rotation.x = 0.9;
        rHip.rotation.x = 0.9;
        lKnee.rotation.x = -1.4;
        rKnee.rotation.x = -1.4;
        break;
      }

      // ─── LEG RAISE ───
      case 'legraise': {
        body.rotation.x = Math.PI / 2;
        body.position.y = -0.85;
        body.position.z = -0.3;

        const d = easedCycle(t, 1.2);

        // Both legs raise together, straight
        lHip.rotation.x = d * 1.5;
        rHip.rotation.x = d * 1.5;
        lKnee.rotation.x = -d * 0.08;
        rKnee.rotation.x = -d * 0.08;

        // Arms flat by sides for stability
        lShoulder.rotation.z = -0.2;
        rShoulder.rotation.z = 0.2;
        break;
      }

      // ─── HIGH KNEES ───
      case 'highknees': {
        const leftUp = Math.max(0, Math.sin(t * 5.5));
        const rightUp = Math.max(0, Math.sin(t * 5.5 + Math.PI));
        const bounce = (leftUp + rightUp) * 0.04;

        body.position.y = bounce;

        // Alternating high knee drives
        lHip.rotation.x = -leftUp * 1.6;
        lKnee.rotation.x = leftUp * 1.9;
        rHip.rotation.x = -rightUp * 1.6;
        rKnee.rotation.x = rightUp * 1.9;

        // Opposite arm pumping like running
        rShoulder.rotation.x = leftUp * 1.2;
        rElbow.rotation.x = -leftUp * 1.3;
        lShoulder.rotation.x = rightUp * 1.2;
        lElbow.rotation.x = -rightUp * 1.3;

        // Slight forward lean
        spine.rotation.x = -0.06;
        break;
      }

      // ─── TRICEP DIP ───
      case 'dip': {
        const d = easedCycle(t, 1.3);

        // Body lowers between hands
        body.position.y = -d * 0.35;

        // Arms behind/beside body (on a bench)
        lShoulder.rotation.x = -0.4;
        rShoulder.rotation.x = -0.4;
        lShoulder.rotation.z = -0.3;
        rShoulder.rotation.z = 0.3;

        // Elbows bend as body lowers
        lElbow.rotation.x = d * 1.5;
        rElbow.rotation.x = d * 1.5;

        // Legs extended forward
        lHip.rotation.x = -0.5;
        rHip.rotation.x = -0.5;
        lKnee.rotation.x = 0.5;
        rKnee.rotation.x = 0.5;

        // Slight lean back
        spine.rotation.x = d * 0.1;
        break;
      }

      // ─── SUPERMAN ───
      case 'superman': {
        body.rotation.x = Math.PI / 2;
        body.position.y = -0.85;
        body.position.z = -0.3;

        const d = easedCycle(t, 1.2);

        // Arms extend forward (overhead when face-down)
        lShoulder.rotation.x = Math.PI - 0.3 + d * 0.4;
        rShoulder.rotation.x = Math.PI - 0.3 + d * 0.4;

        // Spine arches — upper body lifts
        spine.rotation.x = -d * 0.35;
        head.rotation.x = -d * 0.3;

        // Legs lift behind
        lHip.rotation.x = -d * 0.5;
        rHip.rotation.x = -d * 0.5;
        break;
      }

      // ─── CALF RAISE ───
      case 'calfraise': {
        const d = easedCycle(t, 1.5);

        // Rise up on toes
        body.position.y = d * 0.18;

        // Arms slightly out for balance
        lShoulder.rotation.z = -0.15;
        rShoulder.rotation.z = 0.15;
        lShoulder.rotation.x = d * 0.1;
        rShoulder.rotation.x = d * 0.1;
        break;
      }

      // ─── IDLE ───
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
      {/* ── Spine: upper body pivot at pelvis level ── */}
      <group ref={spineRef} position={[0, 0.88, 0]}>
        {/* Torso */}
        <mesh geometry={geo.torso} material={mat.shirt} position={[0, 0.33, 0]} />

        {/* Head */}
        <group ref={headRef} position={[0, 0.87, 0]}>
          <mesh geometry={geo.head} material={mat.skin} />
        </group>

        {/* ── Left Arm ── */}
        <group ref={lShoulderRef} position={[-0.23, 0.62, 0]}>
          <mesh geometry={geo.upperArm} material={mat.shirt} position={[0, -0.2, 0]} />
          <group ref={lElbowRef} position={[0, -0.4, 0]}>
            <mesh geometry={geo.forearm} material={mat.skin} position={[0, -0.18, 0]} />
            <mesh geometry={geo.hand} material={mat.skin} position={[0, -0.36, 0]} />
          </group>
        </group>

        {/* ── Right Arm ── */}
        <group ref={rShoulderRef} position={[0.23, 0.62, 0]}>
          <mesh geometry={geo.upperArm} material={mat.shirt} position={[0, -0.2, 0]} />
          <group ref={rElbowRef} position={[0, -0.4, 0]}>
            <mesh geometry={geo.forearm} material={mat.skin} position={[0, -0.18, 0]} />
            <mesh geometry={geo.hand} material={mat.skin} position={[0, -0.36, 0]} />
          </group>
        </group>
      </group>

      {/* ── Left Leg ── */}
      <group ref={lHipRef} position={[-0.11, 0.88, 0]}>
        <mesh geometry={geo.upperLeg} material={mat.shorts} position={[0, -0.22, 0]} />
        <group ref={lKneeRef} position={[0, -0.44, 0]}>
          <mesh geometry={geo.lowerLeg} material={mat.skin} position={[0, -0.2, 0]} />
          <mesh geometry={geo.foot} material={mat.shoe} position={[0, -0.4, 0.04]} />
        </group>
      </group>

      {/* ── Right Leg ── */}
      <group ref={rHipRef} position={[0.11, 0.88, 0]}>
        <mesh geometry={geo.upperLeg} material={mat.shorts} position={[0, -0.22, 0]} />
        <group ref={rKneeRef} position={[0, -0.44, 0]}>
          <mesh geometry={geo.lowerLeg} material={mat.skin} position={[0, -0.2, 0]} />
          <mesh geometry={geo.foot} material={mat.shoe} position={[0, -0.4, 0.04]} />
        </group>
      </group>
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
