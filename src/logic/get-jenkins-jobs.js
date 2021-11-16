import config from "../config";
import path from "path";



export default async function getJenkinsJobs(folderName) {
  var jenkins = require("jenkins")({baseUrl: config.jenkinsUrl, promisify: true});
  const jobs = await jenkins.job.list(folderName);
  return Promise.all(jobs.map(async(jobData) => {
    const {name} = jobData;
    const target = `${folderName}/${name}`;
    return jenkins.job.get(target);
  }));
}

