/**
 * Material Design 3 Expressive Geometric Shapes
 * SVG path definitions for dashboard visualization
 * Reference: m3.material.io/styles/shape/overview-expressive
 */

// SVG path definitions for M3 Expressive shapes (100x100 viewBox)
window.SHAPES = {
  // Basic geometric shapes
  circle: {
    name: 'Circle',
    path: 'M 50 10 A 40 40 0 1 1 50 90 A 40 40 0 1 1 50 10 Z',
    viewBox: '0 0 100 100'
  },

  square: {
    name: 'Square',
    path: 'M 20 20 L 80 20 L 80 80 L 20 80 Z',
    viewBox: '0 0 100 100'
  },

  diamond: {
    name: 'Diamond',
    path: 'M 50 10 L 90 50 L 50 90 L 10 50 Z',
    viewBox: '0 0 100 100'
  },

  // Rounded/soft shapes
  pill: {
    name: 'Pill (Horizontal)',
    path: 'M 30 20 L 70 20 A 30 30 0 0 1 70 80 L 30 80 A 30 30 0 0 1 30 20 Z',
    viewBox: '0 0 100 100'
  },

  // M3 Expressive organic shapes
  flower: {
    name: 'Flower',
    // 6-petaled flower using circular arcs
    path: `
      M 50 15
      Q 60 20 65 10
      Q 75 25 75 35
      Q 80 45 90 45
      Q 75 50 75 65
      Q 75 75 65 90
      Q 60 80 50 85
      Q 40 80 35 90
      Q 25 75 25 65
      Q 20 50 10 45
      Q 25 45 25 35
      Q 25 25 35 10
      Q 40 20 50 15 Z
    `,
    viewBox: '0 0 100 100'
  },

  boom: {
    name: 'Boom (Starburst)',
    // 8-pointed starburst
    path: `
      M 50 10 L 57 40 L 90 10 L 60 50 L 90 90 L 57 60 L 50 90 L 43 60 L 10 90 L 40 50 L 10 10 L 43 40 Z
    `,
    viewBox: '0 0 100 100'
  },

  softBurst: {
    name: 'Soft Burst',
    // Rounded starburst
    path: `
      M 50 5
      Q 65 15 70 5
      Q 80 20 80 30
      Q 90 35 95 50
      Q 80 55 80 70
      Q 75 85 70 95
      Q 65 85 50 95
      Q 35 85 30 95
      Q 25 85 20 70
      Q 10 55 5 50
      Q 20 35 20 30
      Q 20 15 30 5
      Q 35 15 50 5 Z
    `,
    viewBox: '0 0 100 100'
  },

  leaf: {
    name: 'Leaf',
    path: `
      M 50 10
      Q 70 40 60 85
      Q 50 75 40 85
      Q 30 40 50 10 Z
    `,
    viewBox: '0 0 100 100'
  },

  arch: {
    name: 'Arch',
    path: 'M 20 80 A 30 30 0 0 1 80 80',
    viewBox: '0 0 100 100'
  },

  // Triangle
  triangle: {
    name: 'Triangle',
    path: 'M 50 10 L 90 85 L 10 85 Z',
    viewBox: '0 0 100 100'
  },

  // Pentagon & Hexagon
  pentagon: {
    name: 'Pentagon',
    path: 'M 50 10 L 90 35 L 73 85 L 27 85 L 10 35 Z',
    viewBox: '0 0 100 100'
  },

  hexagon: {
    name: 'Hexagon',
    path: 'M 50 10 L 85 30 L 85 70 L 50 90 L 15 70 L 15 30 Z',
    viewBox: '0 0 100 100'
  },

  // Wavy/Cookie shapes (M3 Expressive multisided)
  wavyStar: {
    name: 'Wavy Star (8-pointed)',
    path: `
      M 50 10
      Q 65 25 70 15
      Q 80 30 85 30
      Q 70 45 80 55
      Q 90 60 90 75
      Q 75 70 65 80
      Q 70 90 50 90
      Q 30 90 35 80
      Q 25 70 10 75
      Q 10 60 20 55
      Q 30 45 15 30
      Q 20 30 35 15
      Q 35 25 50 10 Z
    `,
    viewBox: '0 0 100 100'
  },

  // Ghost/blob shapes
  ghostish: {
    name: 'Ghostish (Blob)',
    path: `
      M 50 10
      Q 80 15 85 40
      Q 90 55 80 70
      Q 70 85 50 88
      Q 30 85 20 70
      Q 10 55 15 40
      Q 20 15 50 10 Z
    `,
    viewBox: '0 0 100 100'
  },

  puffy: {
    name: 'Puffy',
    path: `
      M 50 10
      Q 70 10 80 25
      Q 90 40 85 60
      Q 80 80 50 90
      Q 20 80 15 60
      Q 10 40 20 25
      Q 30 10 50 10 Z
    `,
    viewBox: '0 0 100 100'
  },

  puffyDiamond: {
    name: 'Puffy Diamond',
    path: `
      M 50 10
      Q 75 30 75 50
      Q 75 70 50 90
      Q 25 70 25 50
      Q 25 30 50 10 Z
    `,
    viewBox: '0 0 100 100'
  },

  // Burst/Explosion
  softBoom: {
    name: 'Soft Burst',
    path: `
      M 50 5
      Q 65 15 70 5
      Q 80 20 80 30
      Q 90 35 95 50
      Q 80 55 80 70
      Q 75 85 70 95
      Q 65 85 50 95
      Q 35 85 30 95
      Q 25 85 20 70
      Q 10 55 5 50
      Q 20 35 20 30
      Q 20 15 30 5
      Q 35 15 50 5 Z
    `,
    viewBox: '0 0 100 100'
  },

  // Organic shapes
  bun: {
    name: 'Bun (Rounded Square)',
    path: `
      M 25 15
      Q 15 15 15 25
      L 15 75
      Q 15 85 25 85
      L 75 85
      Q 85 85 85 75
      L 85 25
      Q 85 15 75 15
      L 25 15 Z
    `,
    viewBox: '0 0 100 100'
  },

  heart: {
    name: 'Heart',
    path: `
      M 50 85
      L 20 60
      Q 10 50 10 40
      Q 10 25 25 25
      Q 35 25 50 40
      Q 65 25 75 25
      Q 90 25 90 40
      Q 90 50 80 60
      L 50 85 Z
    `,
    viewBox: '0 0 100 100'
  },

  sunny: {
    name: 'Sunny (Rounded Star)',
    path: `
      M 50 15
      L 60 45
      L 85 50
      L 60 55
      L 50 85
      L 40 55
      L 15 50
      L 40 45
      Z
    `,
    viewBox: '0 0 100 100'
  },

  verySunny: {
    name: 'Very Sunny (Pointed Star)',
    path: `
      M 50 5
      L 60 40
      L 95 45
      L 65 70
      L 75 95
      L 50 75
      L 25 95
      L 35 70
      L 5 45
      L 40 40
      Z
    `,
    viewBox: '0 0 100 100'
  },

  pixelCircle: {
    name: 'Pixel Circle',
    path: `
      M 30 20
      L 40 20
      L 40 10
      L 60 10
      L 60 20
      L 70 20
      L 70 30
      L 80 30
      L 80 50
      L 70 50
      L 70 70
      L 60 70
      L 60 80
      L 40 80
      L 40 70
      L 30 70
      L 30 50
      L 20 50
      L 20 30
      L 30 30
      Z
    `,
    viewBox: '0 0 100 100'
  },

  pixelTriangle: {
    name: 'Pixel Triangle',
    path: `
      M 50 10
      L 70 30
      L 70 50
      L 80 50
      L 80 70
      L 60 70
      L 30 70
      L 20 70
      L 20 50
      L 30 50
      L 30 30
      Z
    `,
    viewBox: '0 0 100 100'
  },

  arrow: {
    name: 'Arrow',
    path: `
      M 50 10
      L 85 50
      L 65 50
      L 65 85
      L 35 85
      L 35 50
      L 15 50
      Z
    `,
    viewBox: '0 0 100 100'
  },

  slanted: {
    name: 'Slanted Hexagon',
    path: `
      M 60 10
      L 85 30
      L 75 85
      L 25 85
      L 15 30
      L 40 10
      Z
    `,
    viewBox: '0 0 100 100'
  },

  semicircle: {
    name: 'Semicircle',
    path: 'M 20 50 A 30 30 0 0 1 80 50 L 80 50 Z',
    viewBox: '0 0 100 100'
  },

  fan: {
    name: 'Fan',
    path: `
      M 50 50
      L 30 20
      Q 50 15 70 20
      L 50 50 Z
    `,
    viewBox: '0 0 100 100'
  },

  leafClover: {
    name: 'Leaf Clover (4)',
    path: `
      M 50 50
      L 50 20
      Q 65 20 70 35
      L 50 50
      M 50 50
      L 70 50
      Q 70 65 55 70
      L 50 50
      M 50 50
      L 50 80
      Q 35 80 30 65
      L 50 50
      M 50 50
      L 30 50
      Q 30 35 45 30
      L 50 50 Z
    `,
    viewBox: '0 0 100 100'
  }
};

/**
 * Generate SVG element for a shape
 * @param {string} shapeKey - Key from SHAPES object
 * @param {object} options - { size, className, id, style }
 * @returns {string} SVG HTML string
 */
window.generateShapeSVG = function(shapeKey, options = {}) {
  const shape = window.SHAPES[shapeKey];
  if (!shape) return '';

  const {
    size = 100,
    className = '',
    id = `shape-${shapeKey}`,
    style = '',
    fill = 'currentColor',
    strokeWidth = 0
  } = options;

  return `
    <svg
      id="${id}"
      class="shape-svg ${className}"
      viewBox="${shape.viewBox}"
      width="${size}"
      height="${size}"
      xmlns="http://www.w3.org/2000/svg"
      style="${style}"
      aria-label="${shape.name}"
    >
      <path
        d="${shape.path}"
        fill="${fill}"
        stroke="${strokeWidth > 0 ? 'currentColor' : 'none'}"
        stroke-width="${strokeWidth}"
      />
    </svg>
  `;
};

/**
 * Create a morphing shape element
 * @param {string} fromShape - Starting shape key
 * @param {string} toShape - Ending shape key
 * @param {object} options - { duration, ease, repeat, yoyo }
 * @returns {object} Animation config
 */
window.createMorphingShape = function(fromShape, toShape, options = {}) {
  const {
    duration = 1,
    ease = 'power1.inOut',
    repeat = -1,
    yoyo = true,
    size = 100
  } = options;

  const fromShapeObj = window.SHAPES[fromShape];
  const toShapeObj = window.SHAPES[toShape];

  if (!fromShapeObj || !toShapeObj) {
    console.warn('Invalid shape keys:', fromShape, toShape);
    return null;
  }

  return {
    fromPath: fromShapeObj.path,
    toPath: toShapeObj.path,
    duration,
    ease,
    repeat,
    yoyo
  };
};

/**
 * List available shapes
 * @returns {array} Shape list
 */
window.listShapes = function() {
  return Object.entries(window.SHAPES).map(([key, shape]) => ({
    key,
    name: shape.name
  }));
};
