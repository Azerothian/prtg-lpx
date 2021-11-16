import config from "../config";
import LaunchpadX from "../logic/launchpadx";

import {EventEmitter} from "events";
import { basename } from "path";
import { customMode4XY } from "../data/buttons";

/*
https://www.semicomplete.com/projects/xdotool/
*/

const screen = {
  "0:0": {
    colour: 0,
    action: "lock",
  },
};


const locked = true;
const lockedColour = 0;
const unlockedColour = 0;



class Window {
  constructor(screen) {
    this.screen = screen;
    this.zIndex = 0;
    this.buf = {};
  }
}

class LockWindow extends Window {
  constructor(screen) {
    super(screen);
    this.buf[`0:0`] = 21;
  }
}

class RenderHelper {
  constructor() {
    this.running = false;
  }
  beginRender = () => {
    this.timeout = setTimeout(async() => {
      if (this.running) {
        await this.render();
      }
      return this.beginRender();
    }, 10);
  }
}


class Screen extends RenderHelper {
  constructor(lp) {
    super();
    this.lp = lp;
    this.windows = [];
    this.renderer = new Renderer(lp);
    this.lp.on("message", this.handleMessageReceived);
  }
  render = () => {
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
    this.windows.reduce((o, win) => {
      if (win.handleButtonDownEvent && !o) {
        return win.handleButtonDownEvent({deltaTime, vel}, xyKey);
      }
      return o;
    }, false);
  }
  handleButtonUpEvent = (deltaTime, message) => {
    const [e, bnum, vel] = message;
    const xyKey = customMode4XY[bnum];
    this.windows.reduce((o, win) => {
      if (win.handleButtonUpEvent && !o) {
        return win.handleButtonUpEvent({deltaTime, vel}, xyKey);
      }
      return o;
    }, false);
  }
}

class Renderer extends RenderHelper {
  constructor(lp) {
    super();
    this.lp = lp;
    this.buf = {};
    this.disp = {};
  }
  initialise = () => {
    for (let x = 0; x <= 8; x++) {
      for (let y = 0; y <= 8; y++) {
        this.setButtonColour(x, y, 0);
        this.buf[`${x}:${y}`] = 0;
      }
    }
  }
  render = () => {
    for (let x = 0; x <= 8; x++) {
      for (let y = 0; y <= 8; y++) {
        const key = `${x}:${y}`;
        if (this.disp[key] !== this.buf[key]) {
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
  const lp = new LaunchpadX();

  // lp.input.ignoreTypes(false, false, false);

  // lp.printInputPorts();
  // lp.printOutputPorts();
  lp.initialise(config.midiDevice);
  lp.reset();
  lp.setMode("programmer");
  lp.on("message", (deltaTime, message) => {
    console.log("message", deltaTime, message);
  });
  const lpRenderer = new Renderer(lp);
  const screen = new Screen(lp);
  lpRenderer.beginRender();
  screen.beginRender();
})();
