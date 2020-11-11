import { Session, Active, MessageEvent } from "./../common/types";
import * as common from "../common/common";

let session: Session;

(async () => {
  session = await Session.init();
})();

async function track(initalURL?: string) {
  const currentActive = session.getActive();
  let url: string;
  if (initalURL) {
    url = initalURL;
  } else {
    url = await common.getActiveTabURL();
  }

  url = common.getHostDomain(url);

  // check if there is an active website being tracked. If there is, check if it is the url and if it is, continue.
  // If not, end the tracking and save the result to storage

  if (currentActive) {
    if (currentActive.websiteData.url == url) return;
    //else
    currentActive.endTracking();

    if (!currentActive.websiteData.potentialDistraction) {
      session.save();
    }
  }

  if (session.isDistractionURL(url)) {
    session.setActiveFromURL(url);
  } else {
    session.setActive(
      new Active({ url, timeSpent: 0, potentialDistraction: true })
    );
    // create an alarm to check if at 30 minuites
    chrome.alarms.create(url, { periodInMinutes: 30 });
    //
  }
}

chrome.storage.onChanged.addListener((changes) => {
  // sync changes with session.distractions();
  // changes.distractions
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason == "install") {
    common.setInitalData();

    // set inital values for storage items
    // open options page???
    // chrome.runtime.openOptionsPage()

    // chrome.runtime.getURL()
    // chrome.tabs.create()
  }
});

chrome.notifications.onButtonClicked.addListener((url, index) => {
  if (index == 0) {
    session.addDistraction(url);
  } else {
    session.addToWhitelist(url);
  }

  chrome.notifications.clear(url);
});

// In popup

chrome.tabs.onActivated.addListener(async () => {

  await track();

 });

chrome.runtime.onMessage.addListener((message, sender) => {
  const currentActive = session.getActive();
  const { event, url }: { event: MessageEvent; url: string } = message;
  if (event == "pageblur") {
    currentActive.endTracking();

    if (!currentActive.websiteData.potentialDistraction) {
      session.save();
    }
  } else {
    if (session.isDistractionURL(url)) {
      session.setActiveFromURL(url);
    } else {
      // const active = new Active({ url, timeSpent: 0})
      // active.startTracking();
      session.setActive(
        new Active({ url, timeSpent: 0, potentialDistraction: true })
      );
      // create an alarm to check every
      chrome.alarms.create(url, { periodInMinutes: 30 });
      //
    }
  }
});

chrome.windows.onFocusChanged.addListener((id) => {
  if (id == chrome.windows.WINDOW_ID_NONE) {
    console.log("Lost focus");
  } else {
    console.log("gained focus");
  }
});

chrome.alarms.onAlarm.addListener(({ name: urlAlarm }) => {
  //   let { url } = await common.getActiveTab();
  //   url = common.getHostDomain(url); // create method to just get url??
  // if the alarm is not cancled, then we are still on this website
  // const currentActive = session.getActive();

  if (session.isDistractionURL(urlAlarm)) {
    chrome.runtime.sendMessage({ event: "timeout" });
  } else {
    // send notification

    chrome.notifications.create(urlAlarm, {
      type: "basic",
      iconUrl: "",
      title: `You have spend a lot of time on ${urlAlarm}`, // You have spent about 30mins
      message: "Would you like us to add this website as a distraction?",
      buttons: [
        { title: "Add to the website as a distraction" },
        { title: "Whitelist this website" },
      ],
    });
  }
});

chrome.tabs.onUpdated.addListener(async (id, info) => {
  if (info?.url) {
    console.log("updated");
    await track(info?.url)
  }
});
