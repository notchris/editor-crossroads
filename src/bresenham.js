export default function bresenham (x0, y0, x1, y1, fn) {
  
  let dx = x1 - x0;
  let dy = y1 - y0;
  let adx = Math.abs(dx);
  let ady = Math.abs(dy);
  let eps = 0;
  let sx = dx > 0 ? 1 : -1;
  let sy = dy > 0 ? 1 : -1;

  if (adx > ady) {
    for (let x = x0, y = y0; sx < 0 ? x >= x1 : x <= x1; x += sx) {
      fn(x, y);
      eps += ady;
      if ((eps<<1) >= adx) {
        y += sy;
        eps -= adx;
      }
    }
  } else {
    for (let x = x0, y = y0; sy < 0 ? y >= y1 : y <= y1; y += sy) {
      fn(x, y);
      eps += adx;
      if ((eps<<1) >= ady) {
        x += sx;
        eps -= ady;
      }
    }
  }

}
