
class Noise {
  constructor() {
    this.noise = this.noise.bind(this);
    this.getUnitVector = this.getUnitVector.bind(this);
  }

  init(gridSize, unitSize, baseGrid) {
    let vectors = [];    
    this.unitSize = unitSize;
    for(let x = 0 ;x <= gridSize; x += unitSize) {
      let v = [];
      for(let y = 0; y <= gridSize; y += unitSize) {
        if (baseGrid) {
          v.push(this.getUnitVector(x, y, baseGrid[Math.floor(x/unitSize)][Math.floor(y/unitSize)]));
        }else {
          v.push(this.getUnitVector(x, y));
        }
      }
      vectors.push(v);
    }
    this.vectors = vectors;
  }

  getUnitVector(x, y, v) {
    let xV = Math.random();
    let yV = Math.sqrt(1 - xV*xV);
    let value = v !== undefined ? v : Math.floor(Math.random() * 255);

    return {
      x: xV * this.randomlyInvert(),
      y: yV * this.randomlyInvert(),
      v: value
    };
  }

  randomlyInvert() {
    return (Math.round(Math.random()) * 2 -1);
  }

  dot2(u, v) {
    return u.x * v.x + u.y * v.y;
  }

  fade(t) {
    return t*t*t*(t*(t*6-15)+10);
  }

  lerp(a, b, t) {
    return (1-t)*a + t*b;
  }

  noise(rawX, rawY) {
    let x = rawX/this.unitSize;
    let y = rawY/this.unitSize;

    let X = Math.floor(x);
    let Y = Math.floor(y);
  
    x = x - X;
    y = y - Y;
    
    var tl = this.dot2(this.vectors[X][Y], {x: x, y: y})*this.vectors[X][Y].v;
    var bl = this.dot2(this.vectors[X][Y+1], {x: x, y: y-1})*this.vectors[X][Y+1].v;
    var tr = this.dot2(this.vectors[X+1][Y], {x: x-1, y: y})*this.vectors[X+1][Y].v;
    var br = this.dot2(this.vectors[X+1][Y+1], {x: x-1, y: y-1})*this.vectors[X+1][Y+1].v;
  
    var u = this.fade(x);
  
      // Interpolate the four results
    const v = this.lerp(
      this.lerp(tl, tr, u),
      this.lerp(bl, br, u),
      this.fade(y));
    return Math.round(v);
  }
}

setColor = (context, r,g,b, a=1) => {
  context.fillStyle = `rgba(${r},${g},${b}, ${a})`;
}

function drawOctave(context, unitSize, fade) {
  const noise = new Noise(unitSize);
  for(let x = 0;x<size;x++) {
    for(let y = 0;y<size;y++) {
      const n = noise.noise(x, y);
      setColor(context, n,n,n, fade);
      context.fillRect(x,y,1,1);
    }
  }  
}

function drawToGrid(width, height, fn) {
  const grid = [];
  for(let x = 0;x<size;x++) {
    const arr = [];
    for(let y = 0;y<size;y++) {
      const result = fn(x, y);
      arr[y] = result;
    }
    grid.push(arr);
  }
  return grid;
}

function drawGrid(grid, size, context, fn) {
  for(let x = 0;x<size;x++) {
    for(let y = 0;y<size;y++) {
      const n = fn !==  undefined ? fn(x, y, grid[x][y]) : grid[x][y];
      setColor(context, n, n, n);
      context.fillRect(x, y, 1, 1);
    }
  }
}

function blend(grid1, grid2, size, fn) {
  const blendedGrid = [];
  for(let x = 0;x<size;x++) {
    const arr = [];
    for(let y = 0;y<size;y++) {
      arr[y] = fn(grid1[x][y], grid2[x][y]);
    }
    blendedGrid.push(arr);
  }
  return blendedGrid;
}

const canvas1 = document.createElement('canvas');
const size = 400;
canvas1.width=size;
canvas1.height=size;

document.getElementById('root').appendChild(canvas1);

const context1 = canvas1.getContext('2d');

const canvas2 = document.createElement('canvas');
canvas2.width=size;
canvas2.height=size;

document.getElementById('root').appendChild(canvas2);

const context2 = canvas2.getContext('2d');

draw = () => {
  const size = 400;
  const unitSize = 400;
  const noise = new Noise();
  let baseGrid = drawToGrid(size, unitSize, (x, y) => 255);
  noise.init(size, unitSize, baseGrid);
  let grid = drawToGrid(size, unitSize, noise.noise);
  drawGrid(grid, size, context1);
  
  drawGrid(grid, size, context2, (x, y, v) => Math.floor(Math.sin(x/5 + v) * 150 ));
  
}

document.getElementById('draw').addEventListener('click', draw);