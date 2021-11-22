import getPRTGSensors from "../../logic/get-prtg-sensors";
import Layer from "../layer";
import LightShowLayer from "./light-show";

export default class PrtgLayer extends Layer {
  constructor(screen) {
    super(screen);
    this.ls = new LightShowLayer(screen);
    screen.windows.push(this.ls);
    this.lsOverride = false;
  }
  // handleButtonDownEvent = () => {
  //   if (!this.ls.running) {
  //     this.ls.start();
  //     this.lsOverride = true;
  //   } else {
  //     this.lsOverride = false;
  //     this.ls.stop();
  //   }
  // }
  exec = async() => {
    const {sensors} = await getPRTGSensors();
    if (!this.lsOverride) {
      const errors = sensors.filter((s) => s.status === "Down");
      if (errors.length > 0) {
        if (!this.ls.running) {
          this.ls.start();
        }
        return;
      }
      if (this.ls.running) {
        this.ls.stop();
      }
    }

    let i = 0;
    for (let y = 0; y <= 8; y++) {
      for (let x = 0; x <= 8; x++) {
        if (i < sensors.length) {
          const sensor = sensors[i];
          switch (sensor.status) {
            case "Warning":
              this.setButtonColour(x, y, 13);
              break;
            case "Down":
              this.setButtonColour(x, y, 72);
              break;
            case "Down (Acknowledged)":
              this.setButtonColour(x, y, 72);
              break;
            default:
              console.log("unknown sensor", sensor);
              this.setButtonColour(x, y, 13);
              break;
          }
        } else {
          this.clearButton(x, y);
        }
        i++;
      }
    }
  }
}
