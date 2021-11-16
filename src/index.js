
import schedule from "node-schedule";
import config from "./config";

import LaunchpadX from "./logic/launchpadx";
import LightShow from "./logic/lightshow";
import getPRTGSensors from "./logic/get-prtg-sensors";
import getJenkinsJobs from "./logic/get-jenkins-jobs";


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
  const lshow = new LightShow(lp);
  // lp.setRGBColour(0, 0, 0, 60, 80);
  // lp.setFlashingColour(1, 1, 13, 72);
  // lp.setPulsingColour(2, 2, 13, 72);
  // lp.setButtonColour(8, 7, 13);


  async function queryAndSetDisplay() {
    lp.setPulsingColour(8, 8, 122);
    const {sensors} = await getPRTGSensors();
    const errors = sensors.filter((s) => s.status === "Down");
    if (errors.length > 0) {
      if (!lshow.isActive()) {
        lshow.start();
      }
      return;
    }
    if (lshow.isActive()) {
      lshow.stop();
    }
    let i = 0;
    for (let y = 0; y <= 3; y++) {
      for (let x = 0; x <= 8; x++) {
        if (i < sensors.length) {
          const sensor = sensors[i];
          switch (sensor.status) {
            case "Warning":
              lp.setButtonColour(x, y, 13);
              break;
            case "Down":
              lp.setPulsingColour(x, y, 72);
              break;
            case "Down (Acknowledged)":
              lp.setButtonColour(x, y, 72);
              break;
            default:
              console.log("unknown sensor", sensor);
              lp.setPulsingColour(x, y, 13);
              break;
          }
        } else {
          lp.setButtonColour(x, y, 0);
        }
        i++;
      }
    }

    i = 0;
    if (config.jenkinsUrl !== "") {
    // get jenkins production jobs
      const jobs = await getJenkinsJobs("Production");
      // console.log("jobData", jobs);
      for (let y = 4; y <= 8; y++) {
        for (let x = 0; x <= 8; x++) {
          if (i < jobs.length) {
            const job = jobs[i];
            switch (job.color) {
              case "blue":
                lp.setButtonColour(x, y, 45);
                break;
              case "notbuilt":
                lp.setButtonColour(x, y, 9);
                break;
              case "red":
                lp.setPulsingColour(x, y, 72);
                break;
              case "blue_anime":
              case "notbuilt_anime":
              case "red_anime":
                lp.setPulsingColour(x, y, 21);
                break;
              default:
                console.log("unknown sensor", job.color);
                lp.setPulsingColour(x, y, 13);
                break;
            }
          } else {
            lp.setButtonColour(x, y, 0);
          }
          i++;
        }
      }
    } else {
      for (let y = 4; y <= 8; y++) {
        for (let x = 0; x <= 7; x++) {
          lp.setButtonColour(x, y, 0);
        }
      }
    }

    lp.setButtonColour(8, 8, 0);

  }
  await queryAndSetDisplay();
  schedule.scheduleJob(config.cron, queryAndSetDisplay);

})();
