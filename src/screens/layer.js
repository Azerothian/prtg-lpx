import Thread from "../utils/thread";

export default class Layer extends Thread {
  constructor(screen) {
    super();
    this.screen = screen;
    this.zIndex = 0;
    this.buf = {};
    this.interval = 10;
  }
  setButtonColour = (x, y, col) => {
    this.buf[`${x}:${y}`] = col;
  }
  clearButton = (x, y) => {
    if (this.buf[`${x}:${y}`]) {
      delete this.buf[`${x}:${y}`];
    }
  }
  resetBuffer = () => {
    this.buf = {};
  }
  stop = () => {
    this.buf = {};
    this.running = false;
    this.paused = false;
    clearTimeout(this.timeout);
  }
}
