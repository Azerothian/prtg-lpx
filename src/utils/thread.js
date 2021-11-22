
export default class Thread {
  constructor(interval = 10) {
    this.running = false;
    this.paused = false;
    this.interval = interval;
  }
  beginExec = () => {
    if (!this.running) {
      return;
    }
    this.prev = new Date().getTime();
    this.timeout = setTimeout(async() => {
      if (!this.paused) {
        await this.exec(new Date().getTime() - this.prev);
        this.prev = new Date().getTime();
      }
      return this.beginExec();
    }, this.interval);
  }
  exec = () => {}
  start() {
    this.running = true;
    return this.beginExec();
  }
  stop = () => {
    this.running = false;
    this.paused = false;
    clearTimeout(this.timeout);
  }
  pause = () => {
    this.paused = true;
  }
  resume = () => {
    this.paused = false;
  }
}
