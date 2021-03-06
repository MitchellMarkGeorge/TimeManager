import { Time } from "./../common/time";
import { Active } from "./../common/active";
import { Session } from "./../common/session";

import * as common from "../common/common";

// TIDY UP BACKGROUD, AND ENCASUALTE METHODS AND OTHER DETAILS

let session: Session;

(async () => {
  session = await Session.init();

  // let url = await common.getActiveTabURL();
  // url = common.getHostDomain(url);
 
  // this handles inital tab
  let { url, id, originalUrl } = await common.getTabURLandID();
  if (url && session.isWhitlistURL(url)) {
    session.setActive(null);
  } else {
    startTracking(url, id, originalUrl);
  }
})();

function startTracking(url: string, tabID: number, originalUrl: string) {
  console.log(url);
  if (!url) return;

  if (session.storage.has(url)) {
    // can be wither a distraction
    let active = session.storage.get(url);
    console.log(active);
    if (session.inLockDown && session.isDistraction(active)) {
      // check if in lockdown and is a distraction -> then this will display the distraction page and set active as null
      // i do this as there is no need to keep set the active, and this also reduces the chance of it being accidentally mutated

      // do i actually need the id? https://developer.chrome.com/extensions/tabs#method-update
      session.setActive(null); // should i do this outside of function
      chrome.tabs.update(tabID, {
        // url: chrome.runtime.getURL("../content/content.html"),
        url: common.getLockdownURL(url, session.endTimeInLockdown, originalUrl),
      });
    } else {
      // only track when not in lockdown or if its not a distraction

      // track distractions not in lockdown
      // track potential distraction in and not in lockdown
      session.setActive(active);
      active.startTracking();
    }
  } else {
    let newActive = new Active({
      url,
      timeSpent: 0,
      potentialDistraction: true,
    });
    session.storage.set(url, newActive);
    session.setActive(newActive);
    newActive.startTracking();
  }
  // }
}

async function track() {
  console.log("track");
  const currentActive = session.getActive();

  let { url, id, originalUrl } = await common.getTabURLandID();
  // check if there is an active website being tracked. If there is, check if it is the url and if it is the same, move one
  // If not, end the tracking and save the result to storage

  if (currentActive) {
    if (currentActive.websiteData.url === url) return; // in case the user is going from tab to tab with the same url
    // this also means the user can "escape" the lockdown by right clicking on the back button

    // end tracking of previous active

    currentActive.endTracking();

    // only save id it is a distrction and not in
    if (session.isDistraction(currentActive)) {
      session.save();
    }
  }
  // what should i do if url is ''

  if (url && session.isWhitlistURL(url)) {
    // console.log("whitelist", url);
    session.setActive(null);
  } else {
    // console.log("tracking", url);
    startTracking(url, id, originalUrl);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponce) => {
  console.log("on message");
  //TIDY THIS UP
  switch (message.request) {
    case "popup-load":
      // check if on the whitelist
      common.getURL().then((url) => {
        if (session.isWhitlistURL(url)) {
          // need to handle if it is lockdown url
          sendResponce({
            isWhitlistURL: true,
            inLockdown: session.inLockDown,
            endTimeInLockdown: session.endTimeInLockdown,
          });
        } else {
          // const currentActive = session.inLockDown
          //   ? session.storage.get(url)
          //   : session.getActive();

          const currentActive = session.getActive();

          sendResponce({
            active: currentActive,
            inLockdown: session.inLockDown,
            endTimeInLockdown: session.endTimeInLockdown,
          });
        }
      });
      break;

    case "popup-remove-whitelist":
      common.getURL().then((url) => {
        const newActive = session.removeFromWhitelist(url);
        session.storage.set(url, newActive);
        session.setActive(newActive);
        newActive.startTracking();
        sendResponce({
          active: newActive,
          inLockdown: session.inLockDown,
          endTimeInLockdown: session.endTimeInLockdown,
        });
      });
      break;

    case "popup-add-whitelist":
      session.addToWhitelist(message.url);
      break;

    case "popup-add-distraction": {
      const currentActive = session.getActive();
      const { url } = currentActive.websiteData;
      chrome.alarms.clear(url); // cluld still have their allarms
      delete currentActive.websiteData.potentialDistraction;
      session.save();
      break;
    }

    case "popup-remove-distraction": {
      const currentActive = session.getActive();
      currentActive.websiteData.potentialDistraction = true;
      session.save();
      break;
    }

    case "popup-lockdown":
      session.inLockDown = true;
      session.endTimeInLockdown = Date.now() + Time.minInMilliseconds(10); // There is a bug when the the mins is small (tested 0.5, 1, 2)
      console.log("End time:", session.endTimeInLockdown)
      chrome.alarms.create("LOCKDOWN", { 
        when: session.endTimeInLockdown, // lockdown distraction sites for 30 mins
      });

      // should this be here
      sendResponce({
        inLockdown: session.inLockDown,
        endTimeInLockdown: session.endTimeInLockdown,
      });

      // is the current page is a distraction,show lockdown page

      // I need to check if there is an active first incase the
      const currentActive = session.getActive();
      // set active to null????
      if (currentActive && session.isDistraction(currentActive)) {
        console.log("entering lockdown", session.getActive());
        // chrome.runtime.sendMessage({ request: "content-lockdown" });
        // stop tracking?
        // console.log(chrome.runtime.getURL("../content/content.html"))
        common.getTabURLandID().then(({ id, url, originalUrl }) => {
          session.setActive(null);
          chrome.tabs.update(id, {
            // the update handler will be called
            // url: chrome.runtime.getURL("../content/content.html"),
            url: common.getLockdownURL(url, session.endTimeInLockdown, originalUrl),
          });
        });
      }
      break;
  }

  return true; // async
});

chrome.windows.onFocusChanged.addListener(async (id) => {
  // do more testing
  await track(); // check if this works
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason == "install") {
    common.setInitalData();
  }
  // set inital values for storage items
});

chrome.notifications.onButtonClicked.addListener((url, index) => {
  if (index == 0) {
    let referencedActive: Active;
    // if it still on the current tab, use that active, else, get from storage
    if (url === session.getActive()?.websiteData?.url) {
      referencedActive = session.getActive();
    } else {
      referencedActive = session.storage.get(url);
    }

    chrome.alarms.clear(referencedActive.websiteData.url); // could still have their alarms - should they tho?
    delete referencedActive.websiteData.potentialDistraction;
    session.save();
  } else {
    session.addToWhitelist(url);
  }
});



// In popup

chrome.tabs.onActivated.addListener(async () => {
  console.log("Activated");

  await track();
});

chrome.alarms.onAlarm.addListener(({ name: urlAlarm }) => {
  // if the alarm is not cancled, then we are still on this website (only canceled in the active.endTracking())
  // const currentActive = session.getActive();
  console.log("Alarm", urlAlarm);

  if (urlAlarm === "LOCKDOWN") {
    session.inLockDown = false;
    session.endTimeInLockdown = 0;

    // show notification???

    chrome.notifications.create({
      iconUrl: "../icons/TimeManagerLogoTrans2.png",
      type: "basic",
      title: "Lockdown ended.",
      message: "You can now access your distractions.",
    });
  } else {
    chrome.notifications.create(urlAlarm, {
      type: "basic",
      iconUrl: "../icons/TimeManagerLogoTrans2.png",
      title: `You have spent a lot of time on ${urlAlarm}`, // You have spent about 30mins
      message: "Would you like us to add this website as a distraction?",
      buttons: [{ title: "Add website" }, { title: "Whitelist website" }],
    });
  }
  console.log("notification created");
});

chrome.tabs.onUpdated.addListener(async (id, info) => {
  // this makes sure it is the track() function is only called when the url of a tab is changed
  if (info?.url) {
    console.log(info?.url);
    console.log("updated");
    await track();
  }
});
