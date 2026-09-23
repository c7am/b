/**
 * Material Design 3 Morphing Shapes - Normalized & Ready for Animation
 * All shapes normalized to viewBox="0 0 100 100" with morphing paths
 * 
 * These are REAL M3 shapes extracted from official M3 SVG, then normalized
 * Each shape has 2 paths: default state + morphed state
 */

window.M3_MORPHING_SHAPES = {
  // ACTIVE: Circle - idle and expanded
  active: {
    idle: "M 50 20 C 36.19 20 25 31.19 25 45 C 25 58.81 36.19 70 50 70 C 63.81 70 75 58.81 75 45 C 75 31.19 63.81 20 50 20 Z",
    hover: "M 50 15 C 32.91 15 20 27.91 20 45 C 20 62.09 32.91 75 50 75 C 67.09 75 80 62.09 80 45 C 80 27.91 67.09 15 50 15 Z",
    label: "Active",
    color: "var(--md-sys-color-primary)"
  },

  // UPCOMING: Rounded pill - idle and expanded
  upcoming: {
    idle: "M 25 35 C 25 30.59 28.59 27 33 27 L 67 27 C 71.41 27 75 30.59 75 35 L 75 55 C 75 59.41 71.41 63 67 63 L 33 63 C 28.59 63 25 59.41 25 55 Z",
    hover: "M 20 32 C 20 28.69 22.69 26 26 26 L 74 26 C 77.31 26 80 28.69 80 32 L 80 58 C 80 61.31 77.31 64 74 64 L 26 64 C 22.69 64 20 61.31 20 58 Z",
    label: "Upcoming",
    color: "var(--md-sys-color-tertiary)"
  },

  // COMPLETED: Star - 5-point star
  completed: {
    idle: "M 50 22 L 58 40 L 77 43 L 62 56 L 67 75 L 50 63 L 33 75 L 38 56 L 23 43 L 42 40 Z",
    hover: "M 50 18 L 60 39 L 83 43 L 65 58 L 72 82 L 50 67 L 28 82 L 35 58 L 17 43 L 40 39 Z",
    label: "Completed",
    color: "var(--md-sys-color-secondary)"
  },

  // MODERATIONS: Shield - rounded shield shape
  moderations: {
    idle: "M 50 20 C 65 20 75 28 75 38 L 75 54 C 75 70 62 78 50 82 C 38 78 25 70 25 54 L 25 38 C 25 28 35 20 50 20 Z",
    hover: "M 50 16 C 68 16 80 26 80 38 L 80 56 C 80 74 66 84 50 88 C 34 84 20 74 20 56 L 20 38 C 20 26 32 16 50 16 Z",
    label: "Moderations",
    color: "var(--md-sys-color-error)"
  },

  // WEEKLY: Oval - rounded ellipse
  weekly: {
    idle: "M 50 22 C 68 22 80 34 80 50 C 80 66 68 78 50 78 C 32 78 20 66 20 50 C 20 34 32 22 50 22 Z",
    hover: "M 50 18 C 70 18 85 31 85 50 C 85 69 70 82 50 82 C 30 82 15 69 15 50 C 15 31 30 18 50 18 Z",
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
