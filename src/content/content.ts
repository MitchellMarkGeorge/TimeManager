import { MessageEvent } from './../common/types';
import * as common from '../common/common';
// chrome.runtime.onMessage.addListener()
// listen for message and display the blacked page component
// import "./content.css";
// MessageEvent
window.addEventListener("blur", () => {
  chrome.runtime.sendMessage({ event: "pageblur", url: common.getHostDomain(location.href) }); // problem: calls when clicking on search bar
});

window.addEventListener("focus", () => {
  chrome.runtime.sendMessage({ event: "pagefocus", url: common.getHostDomain(location.href) });
});

chrome.runtime.onMessage.addListener((message, sender) => {
    const { event }: {event: MessageEvent} = message;

    if (event == "pagetimeout") {
        // render component to body
    }
})
