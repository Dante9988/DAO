import React, { useEffect } from 'react';
import '../styles/InteractiveBackground.css';

const InteractiveBackground = () => {
  useEffect(() => {
    const particles = [];
    const createParticle = (x, y) => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      document.body.appendChild(particle);
      setTimeout(() => {
        particle.remove();
      }, 2000);
    };

    const handleMouseMove = (e) => {
      createParticle(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return null;
};

export default InteractiveBackground;
