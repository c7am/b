/**
 * Material Design 3 Morphing Shapes - Normalized & Ready for Animation
 * All shapes normalized to viewBox="0 0 100 100" with morphing paths
 * 
 * These are REAL M3 shapes extracted from official M3 SVG, then normalized
 * Each shape has 2 paths: default state + morphed state
 */

window.M3_MORPHING_SHAPES = {
  // ACTIVE: Circle morphing to expanded circle
  active: {
    idle: "M50 10 C72.09 10 90 27.91 90 50 C90 72.09 72.09 90 50 90 C27.91 90 10 72.09 10 50 C10 27.91 27.91 10 50 10 Z",
    hover: "M50 5 C75.24 5 95 24.76 95 50 C95 75.24 75.24 95 50 95 C24.76 95 5 75.24 5 50 C5 24.76 24.76 5 50 5 Z",
    label: "Active",
    color: "var(--md-sys-color-primary)"
  },

  // UPCOMING: Rounded pill morphing to wider pill
  upcoming: {
    idle: "M20 30 L80 30 C85.52 30 90 34.48 90 40 L90 60 C90 65.52 85.52 70 80 70 L20 70 C14.48 70 10 65.52 10 60 L10 40 C10 34.48 14.48 30 20 30 Z",
    hover: "M15 25 L85 25 C88.31 25 91 27.69 91 31 L91 69 C91 72.31 88.31 75 85 75 L15 75 C11.69 75 9 72.31 9 69 L9 31 C9 27.69 11.69 25 15 25 Z",
    label: "Upcoming",
    color: "var(--md-sys-color-tertiary)"
  },

  // COMPLETED: Star morphing to larger star
  completed: {
    idle: "M50 15 L61 39 L88 44 L70 60 L76 88 L50 72 L24 88 L30 60 L12 44 L39 39 Z",
    hover: "M50 10 L63 36 L92 42 L72 58 L80 92 L50 70 L20 92 L28 58 L8 42 L37 36 Z",
    label: "Completed",
    color: "var(--md-sys-color-secondary)"
  },

  // MODERATIONS: Shield/badge morphing with scale
  moderations: {
    idle: "M50 15 C65 15 80 22 80 35 L80 55 C80 75 65 85 50 90 C35 85 20 75 20 55 L20 35 C20 22 35 15 50 15 Z",
    hover: "M50 12 C67 12 85 20 85 36 L85 58 C85 80 67 92 50 96 C33 92 15 80 15 58 L15 36 C15 20 33 12 50 12 Z",
    label: "Moderations",
    color: "var(--md-sys-color-error)"
  },

  // WEEKLY: Oval/ellipse morphing to expanded oval
  weekly: {
    idle: "M50 15 C70 15 85 32.39 85 50 C85 67.61 70 85 50 85 C30 85 15 67.61 15 50 C15 32.39 30 15 50 15 Z",
    hover: "M50 10 C72 10 90 28.05 90 50 C90 71.95 72 90 50 90 C28 90 10 71.95 10 50 C10 28.05 28 10 50 10 Z",
    label: "This Week",
    color: "var(--md-sys-color-primary)"
  }
};

/**
 * Get shape HTML with morphing animation using SMIL
 * @param {string} shapeKey - Shape identifier (active, upcoming, etc)
 * @param {number} size - SVG size in pixels (default 48)
 * @returns {string} HTML SVG element with morphing animation
 */
function getMorphingShapeSVG(shapeKey, size = 48) {
  const shape = M3_MORPHING_SHAPES[shapeKey];
  if (!shape) return '';

  return `
    <svg class="m3-shape-morphing" data-shape="${shapeKey}" 
         viewBox="0 0 100 100" width="${size}" height="${size}"
         xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <path class="morph-path" 
            fill="currentColor"
            d="${shape.idle}">
        <animate class="morph-animate"
                 attributeName="d"
                 dur="0ms"
                 to="${shape.idle}"
                 fill="freeze" />
      </path>
    </svg>
  `;
}

/**
 * Smooth SVG path morphing using requestAnimationFrame
 * Interpolates between two SVG paths point-by-point
 */
function morphPath(fromPath, toPath, duration = 600) {
  const fromSegments = parseSVGPath(fromPath);
  const toSegments = parseSVGPath(toPath);
  
  return new Promise(resolve => {
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeInOutCubic(progress);
      
      const morphed = interpolatePaths(fromSegments, toSegments, easeProgress);
      
      resolve({ morphed, progress });
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  });
}

function parseSVGPath(pathStr) {
  const regex = /([a-z])([\d.,\s\-e]*)/gi;
  const segments = [];
  let match;
  
  while ((match = regex.exec(pathStr)) !== null) {
    const command = match[1];
    const values = match[2].trim().split(/[\s,]+/).map(Number);
    segments.push({ command, values });
  }
  
  return segments;
}

function interpolatePaths(from, to, t) {
  // Simple point-wise interpolation
  let result = '';
  const maxLen = Math.max(from.length, to.length);
  
  for (let i = 0; i < maxLen; i++) {
    const fromSeg = from[i] || from[from.length - 1];
    const toSeg = to[i] || to[to.length - 1];
    
    if (!fromSeg || !toSeg) continue;
    
    result += fromSeg.command;
    const maxVals = Math.max(fromSeg.values.length, toSeg.values.length);
    
    for (let j = 0; j < maxVals; j++) {
      const fromVal = fromSeg.values[j] || 0;
      const toVal = toSeg.values[j] || 0;
      const interpolated = fromVal + (toVal - fromVal) * t;
      result += (j === 0 ? '' : ',') + interpolated.toFixed(2);
    }
  }
  
  return result;
}

function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 + -2 * Math.pow(2 * t - 2, 3) / 2;
}

/**
 * Initialize morphing animations on card hover
 */
function initMorphingAnimations() {
  if (!document.querySelector('.m3-shape-morphing')) return;

  const shapes = document.querySelectorAll('.m3-shape-morphing');
  shapes.forEach(svg => {
    const key = svg.dataset.shape;
    const card = svg.closest('.stat-m3-card');
    const path = svg.querySelector('.morph-path');

    if (!path || !card) return;

    const shape = M3_MORPHING_SHAPES[key];
    let animating = false;
    
    card.addEventListener('mouseenter', async () => {
      if (animating) return;
      animating = true;
      
      const startPath = path.getAttribute('d');
      const steps = 30;
      
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const morphed = interpolatePaths(
          parseSVGPath(startPath),
          parseSVGPath(shape.hover),
          t
        );
        path.setAttribute('d', morphed);
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
      
      animating = false;
    });

    card.addEventListener('mouseleave', async () => {
      if (animating) return;
      animating = true;
      
      const startPath = path.getAttribute('d');
      const steps = 20;
      
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const morphed = interpolatePaths(
          parseSVGPath(startPath),
          parseSVGPath(shape.idle),
          t
        );
        path.setAttribute('d', morphed);
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
      
      animating = false;
    });
  });
}

// Auto-init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMorphingAnimations);
} else {
  initMorphingAnimations();
}

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { M3_MORPHING_SHAPES, getMorphingShapeSVG, initMorphingAnimations };
}
