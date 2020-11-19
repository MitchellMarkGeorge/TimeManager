import  React from 'react';
import { MessageEvent } from '../common/types';
import * as common from '../common/common';

import * as ReactDOM from "react-dom";
// chrome.runtime.onMessage.addListener()
// listen for message and display the blacked page component
import "./content.css";
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

chrome.runtime.onMessage.addListener((message, sender) => {
    // const { event }: {event: MessageEvent} = message;

    if (message.request == "content-lockdown") {
        // render component to body

        const url = common.getHostDomain(location.href);

        // document.body
        // <LockdownComponent/>
        // ReactDOM.render(<LockdownComponent/> , document.);

        // const lockdownComponentInstance = React.createElement(LockdownComponent);

        ReactDOM.render(<LockdownComponent url={''}/> , document.body);

    }
})
