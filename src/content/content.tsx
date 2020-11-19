import  React from 'react';
// import { MessageEvent } from '../common/types';
import * as common from '../common/common';

import * as ReactDOM from "react-dom";
// chrome.runtime.onMessage.addListener()
// listen for message and display the blacked page component

import { LockdownComponent } from './components';
// MessageEvent
// window.addEventListener("blur", () => {
//   chrome.runtime.sendMessage({ event: "pageblur", url: common.getHostDomain(location.href) }); // problem: calls when clicking on search bar
// });

// window.addEventListener("focus", () => {
//   chrome.runtime.sendMessage({ event: "pagefocus", url: common.getHostDomain(location.href) });
// });

// document.addEventListener("visibilitychange", () => {
//     console.log( document.visibilityState );
// });


const url = common.getHostDomain(location.href);
ReactDOM.render(<LockdownComponent url={url}/> , document.getElementById('root'));

// chrome.runtime.onMessage.addListener((message, sender) => {
//     // const { event }: {event: MessageEvent} = message;

//     if (message.request == "content-lockdown") {
//         // render component to body

        

//         // document.body
//         // <LockdownComponent/>
//         // ReactDOM.render(<LockdownComponent/> , document.);

//         // const lockdownComponentInstance = React.createElement(LockdownComponent);

        

//     }
// })
