/**
 * Material Design 3 Expressive Shape Morphing
 * Uses GSAP for smooth SVG path morphing
 * Requires: gsap, gsap/Draggable plugin
 */

import { SHAPES, generateShapeSVG } from './shapes.js';

/**
 * Initialize shape morphing on dashboard
 * @param {string} containerId - Element ID containing the shape
 * @param {string} shapePair - Comma-separated shapes (e.g. "flower,boom")
 * @param {object} options - { duration, ease, repeat }
 */
function initShapeMorph(containerId, shapePair = 'circle,flower', options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const [fromShape, toShape] = shapePair.split(',').map(s => s.trim());
  if (!SHAPES[fromShape] || !SHAPES[toShape]) {
    console.warn('Invalid shape pair:', fromShape, toShape);
    return;
  }

  const {
    duration = 2,
    ease = 'power1.inOut',
    repeat = -1,
    yoyo = true,
    size = 64
  } = options;

  // Insert initial SVG
  const svgHtml = generateShapeSVG(fromShape, {
    size,
    className: 'shape-morph',
    id: `${containerId}-svg`
  });
  container.innerHTML = svgHtml;

  // Get path element and start morphing
  const svg = container.querySelector('svg');
  const path = svg.querySelector('path');

  if (!path || typeof gsap === 'undefined') {
    console.warn('GSAP not loaded or path not found');
    return;
  }

  // Use GSAP's attr plugin to morph the path
  gsap.registerPlugin(gsap.plugins?.MotionPathPlugin);

  gsap.to(path, {
    attr: {
      d: SHAPES[toShape].path
    },
    duration,
    ease,
    repeat,
    yoyo,
    onRepeat() {
      // Swap shapes on repeat
      const current = this.targets()[0].getAttribute('d');
      const isToShape = current === SHAPES[toShape].path;
      this.vars.attr.d = isToShape ? SHAPES[fromShape].path : SHAPES[toShape].path;
    }
  });
}

/**
 * Create multiple morphing shapes in sequence
 * @param {array} configs - Array of { id, shapes, options }
 */
function initMultipleMorphs(configs) {
  configs.forEach(({ id, shapes, options }) => {
    initShapeMorph(id, shapes, options);
  });
}

/**
 * Stop all shape morphing animations
 */
function stopAllMorphs() {
  if (typeof gsap !== 'undefined') {
    gsap.killTweensOf('svg path');
  }
}

/**
 * List available shapes for UI selector
 * @returns {array} Shape options
 */
function getAvailableShapes() {
  return Object.entries(SHAPES).map(([key, shape]) => ({
    key,
    name: shape.name
  }));
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const shapeElement = document.getElementById('dashboard-shape');
    if (shapeElement) {
      const morphPair = shapeElement.dataset.morph || 'circle,flower';
      initShapeMorph('dashboard-shape', morphPair, {
        duration: 3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });
    }
  });
} else {
  const shapeElement = document.getElementById('dashboard-shape');
  if (shapeElement) {
    const morphPair = shapeElement.dataset.morph || 'circle,flower';
    initShapeMorph('dashboard-shape', morphPair, {
      duration: 3,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    });
  }
}

export {
  initShapeMorph,
  initMultipleMorphs,
  stopAllMorphs,
  getAvailableShapes
};
