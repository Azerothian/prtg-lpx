import fetch from "node-fetch";
import config from "../config";

export default async function getPRTGSensors() {
  const filterStatus = "filter_status=5&filter_status=4&filter_status=10&filter_status=13&filter_status=14"; // from sensors with alarms
  const response = await fetch(`${config.prtg.host}api/table.json?content=sensors&${filterStatus}&username=${config.prtg.username}&password=${config.prtg.password}`);
  return response.json();
}
