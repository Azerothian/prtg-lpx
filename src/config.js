import "dotenv/config";

export default {
  prtg: {
    host: process.env.PRTG_HOST,
    username: process.env.PRTG_USERNAME,
    password: process.env.PRTG_PASSWORD,
  },
  midiDevice: parseInt(process.env.MIDI_DEVICE_ID),
  cron: process.env.CRON,
};
