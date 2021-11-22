import { getRandomInt } from "../../utils/random";
import Layer from "../layer";
const redColours = [4, 5, 6, 60, 72, 106, 120];

export default class LightShowLayer extends Layer {
  constructor(screen) {
    super(screen);
    this.zIndex = 1;
  }
  exec = () => {
    const x = getRandomInt(0, 8);
    const y = getRandomInt(0, 8);
    const colourIdx = getRandomInt(0, redColours.length - 1);
    this.setButtonColour(x, y, redColours[colourIdx]);
  }
}
