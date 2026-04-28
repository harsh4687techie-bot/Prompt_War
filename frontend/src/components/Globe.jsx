// ====================================================
// VOTEGUIDE AI — 3D Dot Globe Component
// ====================================================

import { useRef, useEffect, useCallback } from 'react';

export default function Globe() {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    dots: [],
    arcs: [],
    rotation: 0,
    targetRotation: 0,
    autoRotate: true,
    isDragging: false,
    lastMouseX: 0,
    radius: 0,
    centerX: 0,
    centerY: 0,
    animationId: null,
  });

  const generateDots = useCallback(() => {
    const dots = [];
    const count = 900;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < count; i++) {
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      dots.push({
        theta,
        phi,
        baseSize: 1.2 + Math.random() * 0.6,
        pulse: Math.random() < 0.03,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
    return dots;
  }, []);

  const generateArcs = useCallback((dots) => {
    const pairs = [
      [50, 300], [120, 600], [200, 750], [400, 800], [10, 500],
      [350, 700], [150, 450], [550, 850],
    ];
    return pairs
      .filter(([a, b]) => a < dots.length && b < dots.length)
      .map(([from, to]) => ({ from, to, progress: Math.random() }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const s = stateRef.current;

    s.dots = generateDots();
    s.arcs = generateArcs(s.dots);

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const size = Math.min(rect.width, 480);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = size + 'px';
      canvas.style.height = size + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s.centerX = size / 2;
      s.centerY = size / 2;
      s.radius = size * 0.38;
    }

    function projectDot(dot, rotY) {
      const sinPhi = Math.sin(dot.phi);
      const cosPhi = Math.cos(dot.phi);
      const sinTheta = Math.sin(dot.theta + rotY);
      const cosTheta = Math.cos(dot.theta + rotY);
      const x = sinPhi * cosTheta;
      const y = cosPhi;
      const z = sinPhi * sinTheta;
      return {
        screenX: s.centerX + x * s.radius,
        screenY: s.centerY - y * s.radius,
        z,
      };
    }

    function render() {
      s.animationId = requestAnimationFrame(render);

      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      if (s.autoRotate) s.targetRotation += 0.003;
      s.rotation += (s.targetRotation - s.rotation) * 0.08;

      const time = Date.now() * 0.001;

      // Globe outline
      ctx.beginPath();
      ctx.arc(s.centerX, s.centerY, s.radius + 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(79, 140, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Sort dots by depth
      const projected = s.dots.map((dot, i) => ({
        ...projectDot(dot, s.rotation),
        dot,
        index: i,
      }));
      projected.sort((a, b) => a.z - b.z);

      // Draw arcs
      for (const arc of s.arcs) {
        const fromP = projectDot(s.dots[arc.from], s.rotation);
        const toP = projectDot(s.dots[arc.to], s.rotation);
        if (fromP.z > -0.2 && toP.z > -0.2) {
          const midX = (fromP.screenX + toP.screenX) / 2;
          const midY = (fromP.screenY + toP.screenY) / 2 - 30;
          const alpha = Math.min(fromP.z, toP.z) * 0.3;
          if (alpha > 0.02) {
            ctx.beginPath();
            ctx.moveTo(fromP.screenX, fromP.screenY);
            ctx.quadraticCurveTo(midX, midY, toP.screenX, toP.screenY);
            ctx.strokeStyle = `rgba(79, 140, 255, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw dots
      for (const p of projected) {
        if (p.z < -0.1) continue;
        const alpha = 0.15 + p.z * 0.65;
        const size = p.dot.baseSize * (0.5 + p.z * 0.6);

        if (p.dot.pulse) {
          const pulseScale = 1 + Math.sin(time * 2 + p.dot.pulsePhase) * 0.5;
          const glowSize = size * 3 * pulseScale;
          const gg = ctx.createRadialGradient(p.screenX, p.screenY, 0, p.screenX, p.screenY, glowSize);
          gg.addColorStop(0, `rgba(251, 191, 36, ${alpha * 0.5})`);
          gg.addColorStop(1, 'rgba(251, 191, 36, 0)');
          ctx.beginPath();
          ctx.arc(p.screenX, p.screenY, glowSize, 0, Math.PI * 2);
          ctx.fillStyle = gg;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(p.screenX, p.screenY, size * 1.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.screenX, p.screenY, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(79, 140, 255, ${alpha})`;
          ctx.fill();
        }
      }

      // Inner glow
      const ig = ctx.createRadialGradient(
        s.centerX - s.radius * 0.3, s.centerY - s.radius * 0.3, 0,
        s.centerX, s.centerY, s.radius
      );
      ig.addColorStop(0, 'rgba(79, 140, 255, 0.03)');
      ig.addColorStop(0.7, 'rgba(79, 140, 255, 0.01)');
      ig.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(s.centerX, s.centerY, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = ig;
      ctx.fill();
    }

    // Interaction handlers
    function onMouseDown(e) {
      s.isDragging = true;
      s.lastMouseX = e.clientX;
      s.autoRotate = false;
    }
    function onMouseMove(e) {
      if (!s.isDragging) return;
      s.targetRotation += (e.clientX - s.lastMouseX) * 0.005;
      s.lastMouseX = e.clientX;
    }
    function onMouseUp() {
      s.isDragging = false;
      setTimeout(() => { s.autoRotate = true; }, 2000);
    }
    function onTouchStart(e) {
      s.isDragging = true;
      s.lastMouseX = e.touches[0].clientX;
      s.autoRotate = false;
    }
    function onTouchMove(e) {
      if (!s.isDragging) return;
      s.targetRotation += (e.touches[0].clientX - s.lastMouseX) * 0.005;
      s.lastMouseX = e.touches[0].clientX;
    }
    function onTouchEnd() {
      s.isDragging = false;
      setTimeout(() => { s.autoRotate = true; }, 2000);
    }

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd);

    resize();
    window.addEventListener('resize', resize);
    render();

    return () => {
      if (s.animationId) cancelAnimationFrame(s.animationId);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', resize);
    };
  }, [generateDots, generateArcs]);

  return (
    <div className="hero-globe">
      <canvas ref={canvasRef} id="globe-canvas" aria-hidden="true" />
      <div className="globe-glow" />
    </div>
  );
}
