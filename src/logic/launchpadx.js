import midi from "midi";
import {customMode3, customMode4} from "../data/buttons";


const sysExHeader = [240, 0, 32, 41, 2, 12];
const LightingType = {
  "Static": 0,
  "Flashing": 1,
  "Pulsing": 2,
  "RGB": 3,
};
const sysExCommand = {
  "Mode": 0,
  "Lighting": 3,
  "DAWMode": 16,
};

export default class LaunchpadX {
  constructor() {
    this.output = new midi.Output();
    // this.current = {};
    // this.intervals = {};
  }
  printPorts = () => {
    const count = this.output.getPortCount();
    console.log("print ports start");
    for (let i = 0; i < count; i++) {
      console.log(`${i} - ${this.output.getPortName(i)}`);
    }
    console.log("print ports end");
  }
  initialise = (port) => {
    this.output.openPort(port);
  }
  setDAWMode = (enabled = false) => {
    this.sendSysEx([sysExCommand.DAWMode, enabled ? 1 : 0]);
  }
  setMode = (mode) => {
    let key;
    switch (mode) {
      case "session": // (only selectable in DAW mode)
        key = 0;
        break;
      case "note":
        key = 1;
        break;
      case "mode1":
        key = 4;
        break;
      case "mode2":
        key = 5;
        break;
      case "mode3":
        key = 6;
        break;
      case "mode4":
        key = 7;
        break;
      case "faders": // (only selectable in DAW mode)
        key = 13;
        break;
      case "programmer": // (only selectable in DAW mode)
        key = 127;
        break;
    }
    this.sendSysEx([sysExCommand.Mode, key]);
  }
  setButtonColour = (row, col, colourId) => {
    const buttonCode = customMode4[row][col];

    this.output.sendMessage([144, buttonCode, colourId]);
    // if (!this.current[row]) {
    //   this.current[row] = {};
    // }
    // this.current[row][col] = buttonCode;
  }
  setRGBColour = (row, col, r, g, b) => {
    const buttonCode = customMode4[row][col];
    this.sendSysEx([sysExCommand.Lighting, LightingType.RGB, buttonCode, r, g, b]);
  }
  setFlashingColour = (row, col, aColourId, bColourId) => {
    const buttonCode = customMode4[row][col];
    this.sendSysEx([sysExCommand.Lighting, LightingType.Flashing, buttonCode, aColourId, bColourId]);
  }
  setPulsingColour = (row, col, colourId) => {
    const buttonCode = customMode4[row][col];
    this.sendSysEx([sysExCommand.Lighting, LightingType.Pulsing, buttonCode, colourId]);
  }

  // setColour = () => {
  //   this.output.sendMessage([240, 0, 32, 41, 2, 12, 3, 0, 11, 13]);
  // }
  sendSysEx = (arr = []) => {
    const msg = [...sysExHeader, ...arr, 247];
    console.log("sendSysEx", msg);
    return this.output.sendMessage(msg);
  }
  reset = async() => {
    for (let x = 0; x <= 8; x++) {
      for (let y = 0; y <= 8; y++) {
        this.setButtonColour(x, y, 0);
      }
    }
  }

}
