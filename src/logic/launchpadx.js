import midi from "midi";
import {customMode3, customMode4} from "../data/buttons";
import {EventEmitter} from "events";
import Thread from "../utils/thread";


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


function isPortAvailable(oi, portName) {
  const count = oi.getPortCount();
  for (let i = 0; i < count; i++) {
    if (oi.getPortName(i).indexOf(portName) > -1) {
      return i;
    }
  }
  return -1;
}

class MidiPort extends Thread {
  constructor({midiPort, targetName}) {
    super(1000);
    this.midiPort = midiPort;
    this.targetName = targetName;
    this.events = new EventEmitter();
    if(this.midiPort.on) {
      this.midiPort.on("message", (deltaTime, message) => this.events.emit("message", deltaTime, message));
    }
  }
  exec = () => {
    const idx = isPortAvailable(this.midiPort, this.targetName);
    let portOpen = this.midiPort.isPortOpen();
    if (!portOpen && idx > -1) {
      this.midiPort.openPort(idx);
      this.events.emit("port-open", this.midiPort);
    } else if (portOpen && idx === -1) {
      this.midiPort.closePort();
    }
  }
  on = (n, f) => this.events.on(n, f);
  isPortOpen = () => {
    return this.midiPort.isPortOpen();
  }
  getPortCount = () => {
    return this.midiPort.getPortCount();
  }
  getPortName = (i) => {
    return this.midiPort.getPortName(i);
  }
  sendMessage = (msg) => {
    return this.midiPort.sendMessage(msg);
  }
}

export default class LaunchpadX {
  constructor(targetName) {
    this.output = new MidiPort({midiPort: new midi.Output(), targetName});
    this.input = new MidiPort({midiPort: new midi.Input(), targetName});
  }
  printOutputPorts = () => {
    console.log("print output ports");
    return this.printPorts(this.output);
  }
  printInputPorts = () => {
    console.log("print input ports");
    return this.printPorts(this.input);
  }
  printPorts = (oi) => {
    const count = oi.getPortCount();
    console.log("print ports start");
    for (let i = 0; i < count; i++) {
      console.log(`${i} - ${oi.getPortName(i)}`);
    }
    console.log("print ports end");
  }
  start = () => {
    this.input.start();
    this.output.start();
  }

  setDAWMode = (enabled = false) => {
    return this.sendSysEx([sysExCommand.DAWMode, enabled ? 1 : 0]);
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
    return this.sendSysEx([sysExCommand.Mode, key]);
  }
  setButtonColour = (row, col, colourId) => {
    if (this.output.isPortOpen()) {
      const buttonCode = customMode4[row][col];
      return this.output.sendMessage([144, buttonCode, colourId]);
    }
    return undefined;
  }
  setRGBColour = (row, col, r, g, b) => {
    const buttonCode = customMode4[row][col];
    return this.sendSysEx([sysExCommand.Lighting, LightingType.RGB, buttonCode, r, g, b]);
  }
  setFlashingColour = (row, col, aColourId, bColourId) => {
    const buttonCode = customMode4[row][col];
    return this.sendSysEx([sysExCommand.Lighting, LightingType.Flashing, buttonCode, aColourId, bColourId]);
  }
  setPulsingColour = (row, col, colourId) => {
    const buttonCode = customMode4[row][col];
    return this.sendSysEx([sysExCommand.Lighting, LightingType.Pulsing, buttonCode, colourId]);
  }

  // setColour = () => {
  //   this.output.sendMessage([240, 0, 32, 41, 2, 12, 3, 0, 11, 13]);
  // }
  sendSysEx = (arr = []) => {
    if (this.output.isPortOpen()) {
      const msg = [...sysExHeader, ...arr, 247];
      console.log("sendSysEx", msg);
      return this.output.sendMessage(msg);
    }
    return undefined;
  }
  reset = async() => {
    for (let x = 0; x <= 8; x++) {
      for (let y = 0; y <= 8; y++) {
        this.setButtonColour(x, y, 0);
      }
    }
  }

}
