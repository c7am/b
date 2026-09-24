import React from 'react';
import '@m3e/react/shape';
import '@m3e/react/card';

/**
 * ShapeCard wraps card content in expressive M3E shapes
 * Shapes morph smoothly via CSS clip-path transitions
 */
export const ShapeCard = ({
  shape = '12-sided-cookie', // Default shape (see M3E docs for all 31)
  children,
  elevated = true,
  style = {},
}) => (
  <m3e-card elevated={elevated} style={style}>
    <m3e-shape
      name={shape}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '120px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </m3e-shape>
  </m3e-card>
);

/**
 * Shape names available (all respond to morphing):
 * 4-leaf-clover, 4-sided-cookie, 6-sided-cookie, 7-sided-cookie
 * 8-leaf-clover, 9-sided-cookie, 12-sided-cookie
 * arch, arrow, boom, bun, burst, circle, diamond
 * fan, flower, gem, ghost-ish, heart, hexagon, oval
 * pentagon, pill, pixel-circle, pixel-triangle, puffy
 * puffy-diamond, semicircle, slanted, soft-boom, soft-burst
 * square, sunny, triangle, very-sunny
 */
