import midi from "midi";
import schedule from "node-schedule";
import fetch from "node-fetch";

import config from "./config";
import {customMode3, customMode4} from "./data/buttons";
import {_} from "core-js";


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
}

class LaunchpadX {
  constructor() {
    this.output = new midi.Output();
    // this.current = {};
    // this.intervals = {};
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


async function getPRTGSensors() {
  const response = await fetch(`${config.prtg.host}api/table.json?content=sensors&filter_status=4&username=${config.prtg.username}&password=${config.prtg.password}`);
  return response.json();
}




(async() => {

  const lp = new LaunchpadX();
  lp.initialise(config.midiDevice);
  lp.reset();
  lp.setMode("programmer");
  // lp.setRGBColour(0, 0, 0, 60, 80);
  // lp.setFlashingColour(1, 1, 13, 72);
  // lp.setPulsingColour(2, 2, 13, 72);
  // lp.setButtonColour(8, 7, 13);


  async function queryAndSetDisplay() {
    lp.setPulsingColour(8, 8, 122);
    const {sensors} = await getPRTGSensors();
    let i = 0;
    for (let y = 0; y <= 8; y++) {
      for (let x = 0; x <= 8; x++) {
        if (i < sensors.length) {
          const sensor = sensors[i];
          switch (sensor.status) {
            case "Warning":
              lp.setButtonColour(x, y, 13);//13);
              break;
            default:
              console.log("unknown sensor", sensor);
              lp.setPulsingColour(x, y, 72);
              break;
          }
        } else {
          lp.setButtonColour(x, y, 0);
        }
        i++;
      }
    }
  }
  await queryAndSetDisplay();
  schedule.scheduleJob(config.cron, queryAndSetDisplay);

})();


// schedule.scheduleJob(config.cron, )




// import midi from "midi";

// import {customMode3, customMode4} from "./data/buttons";


// class LaunchpadX {
//   constructor() {
//     this.output = new midi.Output();
//     this.current = {};
//     this.intervals = {};
//   }
//   initialise = (port) => {
//     this.output.openPort(port);
//   }
//   setButtonColour = (row, col, colourIndex) => {
//     const buttonCode = customMode4[row][col];
//     this.output.sendMessage([144, buttonCode, colourIndex]);
//     if (!this.current[row]) {
//       this.current[row] = {};
//     }
//     this.current[row][col] = buttonCode;
//   }

// }




// const colours = [13, 21, 29, 37, 45, 45, 53, 61];


// const lp = new LaunchpadX();
// lp.initialise(2);
// let cc = 0;
// for (let x = 0; x <= 8; x++) {
//   for (let y = 0; y <= 8; y++) {
//     cc = cc + 1;
//     if (cc >= colours.length) {
//       cc = 0;
//     }
//     changeColours(x, y, cc);
//   }
// }


// async function changeColours(x, y, c) {
//   if (c >= colours.length) {
//     c = 0;
//   }
//   lp.setButtonColour(x, y, colours[c]);
//   setTimeout(() => changeColours(x, y, c + 1), 50);
// }



// function sleep(ms = 100) {
//   return new Promise((resolve, reject) => {
//     return setTimeout(resolve, ms);
//   });
// }





