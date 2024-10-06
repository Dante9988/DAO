import React, { useEffect } from 'react';
import '../styles/ParticleTrail.css';

const ParticleTrail = () => {
  useEffect(() => {
    const handleMouseMove = (e) => {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = `${e.pageX}px`;
      particle.style.top = `${e.pageY}px`;

      document.body.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 2000);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return null;
};

export default ParticleTrail;
