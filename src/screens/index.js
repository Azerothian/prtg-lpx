import config from "../config";
import LaunchpadX from "../logic/launchpadx";
import { customMode4XY } from "../data/buttons";
import Thread from "../utils/thread";
import PrtgLayer from "./layers/prtg";
import ShimmerLayer from "./layers/shimmer";

/*
https://www.semicomplete.com/projects/xdotool/
*/

class Screen extends Thread {
  constructor(lp) {
    super();
    this.lp = lp;
    this.windows = [];
    this.renderer = new Renderer(lp);
    this.lp.input.on("message", this.handleMessageReceived);
    this.buttons = {};
  }
  start() {
    this.renderer.start();
    return super.start();
  }
  exec = () => {
    const buf = {};
    this.windows.sort((a, b) => a.zIndex - b.zIndex).forEach((win) => {
      Object.keys(win.buf).forEach((bKey) => {
        buf[bKey] = win.buf[bKey];
      });
    });
    this.renderer.buf = buf;
  }
  handleMessageReceived = (deltaTime, message) => {
    const messageType = message[0];
    switch (messageType) {
      case 160: //press down
        return this.handleButtonDownEvent(deltaTime, message);
      case 144:
        return this.handleButtonUpEvent(deltaTime, message);
    }
    return undefined;
  }
  handleButtonDownEvent = (deltaTime, message) => {
    const [e, bnum, vel] = message;
    const xyKey = customMode4XY[bnum];
    if (!this.buttons[xyKey]) {
      this.buttons[xyKey] = true;
      this.windows.reduce((o, win) => {
        if (win.handleButtonDownEvent && !o) {
          return win.handleButtonDownEvent({deltaTime, vel}, xyKey);
        }
        return o;
      }, false);
    }
  }
  handleButtonUpEvent = (deltaTime, message) => {
    const [e, bnum, vel] = message;
    const xyKey = customMode4XY[bnum];
    if (this.buttons[xyKey]) {
      this.windows.reduce((o, win) => {
        if (win.handleButtonUpEvent && !o) {
          return win.handleButtonUpEvent({deltaTime, vel}, xyKey);
        }
        return o;
      }, false);
      delete this.buttons[xyKey];
    }
  }

}

class Renderer extends Thread {
  constructor(lp) {
    super();
    this.lp = lp;
    this.buf = {};
    this.disp = {};
    this.time = 0;
  }
  start() {
    for (let x = 0; x <= 8; x++) {
      for (let y = 0; y <= 8; y++) {
        this.lp.setButtonColour(x, y, 0);
        this.buf[`${x}:${y}`] = 0;
      }
    }
    this.prev = new Date().getTime();
    return super.start();
  }
  exec = (updateTime) => {
    this.time += updateTime;
    let refresh = false;
    if (this.time > 1000) {
      refresh = true;
      this.time = 0;
    }
    for (let x = 0; x <= 8; x++) {
      for (let y = 0; y <= 8; y++) {
        const key = `${x}:${y}`;
        if (this.disp[key] !== this.buf[key] || refresh) {
          this.lp.setButtonColour(x, y, this.buf[key]);
          this.disp[key] = this.buf[key];
        }
      }
    }
  }
  set = (x, y, c) => {
    this.buf[`${x}:${y}`] = c;
  }
}


(async() => {
  const lp = new LaunchpadX(config.midiDevice);
  lp.output.on("port-open", () => {
    console.log("port-open-output");
    lp.reset();
    lp.setMode("programmer");
  });
  lp.printInputPorts();
  lp.printOutputPorts();
  lp.start();

  // const lpRenderer = new Renderer(lp);
  const screen = new Screen(lp);
  // lpRenderer.start();
  const prtgWindow = new PrtgLayer(screen);
  prtgWindow.start();
  const shimmerLayer = new ShimmerLayer(screen);
  shimmerLayer.start();
  screen.windows.push(prtgWindow);
  screen.windows.push(shimmerLayer);
  screen.start();
})();
