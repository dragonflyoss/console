import SimplexNoise from 'simplex-noise';

const hsla = (h, s, l, a) => `hsla( ${h}, ${s}%, ${l}%, ${a})`;
const rand = (min, max) => Math.random() * (max - min) + min;

const unit = 30;
const cols = 24;
const rows = 24;
const w = unit * cols;
const h = unit * rows;
const offInc = 0.04;
const tickMult = 0.003;
let tick = 0;
const simplex = new SimplexNoise();

export default class Particle {
  constructor(ctx) {
    this.ctx = ctx;
    this.path = [];
    this.noiseDirection = 0;
    this.noiseMagnitude = 0;
    this.pathLength = 6;
    this.speed = 10;
    this.reset();
  }

  reset = () => {
    this.path.length = 0;
    this.x = rand(0, w);
    this.y = rand(0, h);
    this.cx = 0;
    this.cy = 0;
    this.vx = 0;
    this.vy = 0;
    this.alpha = 0;
  };

  step = () => {
    if (this.alpha < 1) {
      this.alpha += 0.025;
    }

    this.x += this.vx;
    this.y += this.vy;
    this.cx = Math.max(0, Math.min(cols - 1, Math.floor(this.x / unit)));
    this.cy = Math.max(0, Math.min(rows - 1, Math.floor(this.y / unit)));

    this.path.unshift(this.x, this.y);
    if (this.path.length > this.pathLength * 2) {
      this.path.pop();
      this.path.pop();
    }

    const len = this.path.length;
    if (len > 0) {
      const _lastPointX = this.path[len - 2];
      const _lastPointY = this.path[len - 1];
      if (
        _lastPointX > w ||
        _lastPointX < 0 ||
        _lastPointY > h ||
        _lastPointY < 0
      ) {
        this.reset();
      }
    }

    let _noise1 = simplex.noise3D(
      offInc * this.cx,
      offInc * this.cy,
      tick * tickMult,
    );
    _noise1 = Math.min(1, _noise1);
    _noise1 = Math.max(-1, _noise1);
    this.noiseDirection = (_noise1 + 1) * Math.PI;

    let _noise2 = simplex.noise3D(
      offInc * this.cx,
      offInc * this.cy,
      tick * tickMult + 100,
    );
    _noise2 = Math.min(1, _noise2);
    _noise2 = Math.max(-1, _noise2);
    this.noiseMagnitude = (_noise2 + 1) / 2;

    this.vxTarget =
      Math.cos(this.noiseDirection) * this.noiseMagnitude * this.speed;
    this.vyTarget =
      Math.sin(this.noiseDirection) * this.noiseMagnitude * this.speed;

    this.vx += (this.vxTarget - this.vx) * 0.1;
    this.vy += (this.vyTarget - this.vy) * 0.1;
  };

  draw = () => {
    const len = this.path.length;
    if (len > 0) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.x, this.y);
      this.ctx.lineTo(this.path[len - 2], this.path[len - 1]);
      this.ctx.strokeStyle = hsla(
        tick + ((this.x + this.y) / (w + h)) * 180,
        80,
        50,
        this.alpha,
      );
      this.ctx.stroke();
    }
  };
}
