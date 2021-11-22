import Layer from "../layer";


import {customMode4XY, customMode4XY2} from "../../data/buttons";
import { getRandomInt } from "../../utils/random";
const colours = [13, 21, 29, 37, 45, 45, 53, 61];

const dirs = [
  {x: -1, y: -1},
  {x: -1, y: 0},
  {x: -1, y: 1},
  {x: 0, y: -1},
  {x: 0, y: 1},
  {x: 1, y: -1},
  {x: 1, y: 0},
  {x: 1, y: 1},
];
const bounds = {x: -1, y: -1, width: 9, height: 9};


export default class ShimmerLayer extends Layer {
  constructor(screen) {
    super(screen);
    this.zIndex = 2;
    this.interval = 50;
    this.vectors = [];
  }
  handleButtonDownEvent = ({deltaTime, vel}, xyKey) => {

    if (xyKey.key === "8:0") {
      this.resetBuffer();
    } else {
      console.log(`${deltaTime} - ${vel}`, xyKey);
      const pos = {...xyKey};
      dirs.forEach((dir) => {
        this.vectors.push({pos, dir, col: colours[getRandomInt(0, 7)]});
      });
    }
  }
  exec = (updateTime) => {
    const newVec = [];
    if (this.vectors.length > 0) {
      this.vectors.forEach((v, idx) => {
        this.clearButton(v.pos.x, v.pos.y);
        if (inBounds(v.pos, bounds)) {
          newVec.push({
            pos: addVec(v.pos, {x: v.dir.x, y: v.dir.y}),
            dir: v.dir,
            col: v.col,
          });
        }
      });
      newVec.forEach((v) => {
        this.setButtonColour(v.pos.x, v.pos.y, v.col);
      });
      this.vectors = newVec;
      if (this.vectors.length > 50) {
        this.vectors.splice(0, this.vectors.length - 50);
      }
    }
  }
}

function addVec(v1, v2) {
  return {x: v1.x + v2.x, y: v1.y + v2.y};
}
function inBounds(v1, bounds) {
  return (v1.x >= bounds.x && v1.y >= bounds.y && v1.x <= (bounds.x + bounds.width) && v1.y <= (bounds.y + bounds.height));
}
