import  React from 'react';
import * as ReactDOM from "react-dom";
import { LockdownComponent } from './components';
import { Time } from '../common/time';



const params = new URLSearchParams(window.location.search);
const endTimeInLockdown = parseInt(params.get('endTimeInLockdown'));
// ENCAPSULATE INTO A METHOD
let timeLeftInLockdown = new Time(endTimeInLockdown - Date.now()).inMinuites();
timeLeftInLockdown = Math.floor(timeLeftInLockdown);

ReactDOM.render(<LockdownComponent timeLeftInLockdown={timeLeftInLockdown} url={params.get('url')}/> , document.getElementById('root'));
