import "dotenv/config";

export default {
  prtg: {
    host: process.env.PRTG_HOST,
    username: process.env.PRTG_USERNAME,
    password: process.env.PRTG_PASSWORD,
  },
  midiDevice: process.env.MIDI_DEVICE,
  cron: process.env.CRON,
  jenkinsUrl: process.env.JENKINS,
};
