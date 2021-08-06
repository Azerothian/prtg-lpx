
const colours = [13, 21, 29, 37, 45, 45, 53, 61];
const redColours = [4, 5, 6, 60, 72, 106, 120];
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default class LightShow {
  constructor(lp) {
    this.lp = lp;
    // this.active = false;
  }
  isActive = () => {
    return !!this.interval;
  }
  start = () => {
    this.interval = setInterval(() => {
      const x = getRandomInt(0, 8);
      const y = getRandomInt(0, 8);
      const colourIdx = getRandomInt(0, redColours.length - 1);
      this.lp.setButtonColour(x, y, redColours[colourIdx]);
    }, 10);
  }
  stop = () => {
    clearInterval(this.interval);
  }
}





