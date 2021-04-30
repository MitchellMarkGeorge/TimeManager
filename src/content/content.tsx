import React from "react";
import * as ReactDOM from "react-dom";
import { LockdownComponent } from "./components";
import { Time } from "../common/time";



const params = new URLSearchParams(window.location.search);
const endTimeInLockdown = parseInt(params.get("endTimeInLockdown"));

let timeLeftInLockdown = new Time(endTimeInLockdown - Date.now()).inMinuites();
timeLeftInLockdown = Math.floor(timeLeftInLockdown);
console.log(timeLeftInLockdown);

if (timeLeftInLockdown <= 0) {
  
  location.href = params.get("originalUrl");
  
}

ReactDOM.render(
  <LockdownComponent
    timeLeftInLockdown={timeLeftInLockdown}
    url={params.get("url")}
  />,
  document.getElementById("root")
);
