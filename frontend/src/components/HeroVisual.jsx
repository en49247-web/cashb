import React, { useEffect, useRef, useState } from 'react';

function HeroVisual() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [executedAmount, setExecutedAmount] = useState(148250);

  useEffect(() => {
    const calculateAmount = () => {
      const baseValue = 148250;
      const startDate = new Date('2026-06-01T00:00:00Z');
      const today = new Date();
      const msDiff = today.getTime() - startDate.getTime();
      const daysElapsed = Math.max(0, Math.floor(msDiff / (1000 * 60 * 60 * 24)));
      
      // Calculate daily increments
      let total = baseValue;
      for (let i = 0; i < daysElapsed; i++) {
        const dailyIncrement = 8000 + ((i * 9301 + 49297) % 233280) / 233280 * 7000;
        total += dailyIncrement;
      }
      
      // Calculate real-time seconds progress
      const secondsElapsedToday = today.getHours() * 3600 + today.getMinutes() * 60 + today.getSeconds();
      const currentDayProgress = (secondsElapsedToday / 86400) * 11500;
      
      return Math.floor(total + currentDayProgress);
    };

    setExecutedAmount(calculateAmount());

    const interval = setInterval(() => {
      setExecutedAmount(calculateAmount());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = canvas.width = 640;
    let height = canvas.height = 640;

    // Handle resize
    const resizeCanvas = () => {
      if (containerRef.current) {
        width = canvas.width = containerRef.current.clientWidth;
        height = canvas.height = containerRef.current.clientHeight || 640;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 3D coordinates for a wireframe sphere
    const points = [];
    const numLatitudes = 8;
    const numLongitudes = 12;
    const radius = 235;

    for (let i = 0; i < numLatitudes; i++) {
      const lat = (Math.PI * i) / (numLatitudes - 1) - Math.PI / 2;
      for (let j = 0; j < numLongitudes; j++) {
        const lon = (2 * Math.PI * j) / numLongitudes;
        const x = radius * Math.cos(lat) * Math.cos(lon);
        const y = radius * Math.sin(lat);
        const z = radius * Math.cos(lat) * Math.sin(lon);
        points.push({ x, y, z, baseSize: Math.random() * 2.5 + 1.5 });
      }
    }

    // Connective lines structure
    const connections = [];
    for (let i = 0; i < numLatitudes; i++) {
      for (let j = 0; j < numLongitudes; j++) {
        const idx1 = i * numLongitudes + j;
        // Connect to next longitude node
        const idx2 = i * numLongitudes + ((j + 1) % numLongitudes);
        connections.push([idx1, idx2]);

        // Connect to next latitude node
        if (i < numLatitudes - 1) {
          const idx3 = (i + 1) * numLongitudes + j;
          connections.push([idx1, idx3]);
        }
      }
    }

    // Interactive mouse coordinates
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0, active: false };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left - width / 2;
      mouse.targetY = e.clientY - rect.top - height / 2;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Initial rotations
    let rotX = 0;
    let rotY = 0;
    let speedX = 0.003;
    let speedY = 0.004;

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse damping
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.1;
        mouse.y += (mouse.targetY - mouse.y) * 0.1;
        
        // Tilt based on mouse
        rotX = mouse.y * 0.003;
        rotY = mouse.x * 0.003;
      } else {
        // Auto rotate
        rotX += speedX;
        rotY += speedY;
      }

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      const focalLength = 300;
      const projected = [];

      // Rotate and project points
      points.forEach((p) => {
        // Rotate Y
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;

        // Rotate X
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        // Perspective projection
        const scale = focalLength / (focalLength + z2 + 100);
        const projX = x1 * scale + width / 2;
        const projY = y2 * scale + height / 2;

        projected.push({ x: projX, y: projY, z: z2, scale });
      });

      // Draw lines with depth-based opacity
      ctx.lineWidth = 0.75;
      connections.forEach(([i, j]) => {
        const p1 = projected[i];
        const p2 = projected[j];
        
        if (p1 && p2) {
          const depth = (p1.z + p2.z) / 2;
          const alpha = Math.max(0.05, 1 - (depth + radius) / (2 * radius));
          ctx.strokeStyle = `rgba(189, 52, 254, ${alpha * 0.22})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      });

      // Draw points
      projected.forEach((p, idx) => {
        const basePt = points[idx];
        const depth = p.z;
        const alpha = Math.max(0.1, 1 - (depth + radius) / (2 * radius));
        const size = basePt.baseSize * p.scale;

        // Draw regular nodes
        ctx.fillStyle = `rgba(189, 52, 254, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Add glow to some nodes
        if (idx % 15 === 0) {
          ctx.shadowColor = '#bd34fe';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }
      });

      // Draw 3D Floating Logos (₿, Ξ, ₮) at specific nodes
      const specialNodes = [
        { idx: 12, label: '₿', color: '#F7931A' },
        { idx: 45, label: 'Ξ', color: '#627EEA' },
        { idx: 78, label: '₮', color: '#26A17B' }
      ];

      specialNodes.forEach(({ idx, label, color }) => {
        const p = projected[idx];
        if (p) {
          ctx.save();
          // Draw background circle for the coin symbol
          ctx.fillStyle = 'rgba(13, 18, 39, 0.95)';
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.0;
          ctx.shadowColor = color;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 20 * p.scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Draw symbol text
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.round(17 * p.scale)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, p.x, p.y);
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="hero-visual-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '640px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <canvas 
        ref={canvasRef} 
        style={{ 
          maxWidth: '100%', 
          maxHeight: '100%',
          filter: 'drop-shadow(0 0 25px rgba(189, 52, 254, 0.2))' 
        }} 
      />

      {/* Floating Alert (USDT executed) */}
      <div 
        className="glass-panel"
        style={{
          position: 'absolute',
          bottom: '35px',
          right: '20px',
          padding: '20px 24px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(0, 230, 118, 0.35)',
          background: 'rgba(6, 9, 20, 0.95)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 10px 40px rgba(0, 230, 118, 0.2)',
          animation: 'float-card-y 4s ease-in-out infinite',
          maxWidth: '340px',
          zIndex: 5
        }}
      >
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'rgba(0, 230, 118, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--success)',
          flexShrink: 0
        }}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px' }}>USDT Settlement Success</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffffff', marginTop: '2px', fontFamily: 'monospace' }}>{executedAmount.toLocaleString('en-US')} USDT Executed</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: '800', marginTop: '4px' }}>⚡ In 3 mins 42 secs</div>
        </div>
      </div>

      {/* Floating Info Box (System Status) */}
      <div 
        className="glass-panel"
        style={{
          position: 'absolute',
          top: '30px',
          left: '15px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(189, 52, 254, 0.25)',
          background: 'rgba(6, 9, 20, 0.9)',
          boxShadow: 'var(--shadow-glow)',
          animation: 'float-card-y-reverse 4.5s ease-in-out infinite',
          maxWidth: '220px',
          zIndex: 5
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="top-bar-pulse" style={{ width: '8px', height: '8px' }}></span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Live System Load</span>
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>99.98% Uptime</div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>OTC Liquidity Pool: Active</div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float-card-y {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
        @keyframes float-card-y-reverse {
          0% { transform: translateY(0px); }
          50% { transform: translateY(12px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}

export default HeroVisual;
