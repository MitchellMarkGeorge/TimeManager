import { Session, Active, MessageEvent } from "./../common/types";
import * as common from "../common/common";

let session: Session;

(async () => {
  session = await Session.init();
  console.log(session);

  // let url = await common.getActiveTabURL();
  // url = common.getHostDomain(url);

  let url = await getURL();
  startTracking(url);

  // if (url && !session.whitelist.includes(url)) {
  //   if (session.storage.has(url)) {
  //     // can be wither a distraction
  //     let newActive = session.storage.get(url);
  //     session.setActive(newActive);
  //     // I should send reminder if i spend too much time on this page.
  //   } else {
  //     let newActive = new Active({
  //       url,
  //       timeSpent: 0,
  //       potentialDistraction: true,
  //     });
  //     session.storage.set(url, newActive);
  //     session.setActive(newActive);
  //     chrome.alarms.create(url, { periodInMinutes: 2 });
  //   }
  // }
  // chrome.notifications.create('', {
  //   type: "basic",
  //   iconUrl: "../icons/TimeManagerLogoTrans2.png",
  //   title: `You have spent a lot of time on ${'urlAlarm'}`, // You have spent about 30mins
  //   message: "Would you like us to add this website as a distraction?",
  //   buttons: [{ title: "Add website" }, { title: "Whitelist website" }],
  // });
})();
//Check inital site???

async function getURL(initalURL?: string) {
  let url: string;
  if (initalURL) {
    url = initalURL;
  } else {
    url = await common.getActiveTabURL();
  }

  url = common.getHostDomain(url);

  return url;
}

function startTracking(url: string) {
  if (url && !session.whitelist.includes(url)) {
    if (session.storage.has(url)) {
      // can be wither a distraction
      let newActive = session.storage.get(url);
      session.setActive(newActive);
      // I should send reminder if i spend too much time on this page.
    } else {
      let newActive = new Active({
        url,
        timeSpent: 0,
        potentialDistraction: true,
      });
      session.storage.set(url, newActive);
      session.setActive(newActive);
      // chrome.alarms.create(url, { when: Date });
    }
  }
}

async function track(initalURL?: string) {
  const currentActive = session.getActive();
  // let url: string;
  // if (initalURL) {
  //   url = initalURL;
  // } else {
  //   url = await common.getActiveTabURL();
  // }

  // url = common.getHostDomain(url);

  let url = await getURL(initalURL);

  // check if there is an active website being tracked. If there is, check if it is the url and if it is, continue.
  // If not, end the tracking and save the result to storage

  if (currentActive) {
    if (currentActive.websiteData.url == url) return;
    //else
    console.log(currentActive);
    currentActive.endTracking();
    // this makes sure that only changed distractions are saved and that it is not saved any time the tab is changed, but only then it is a distraction
    if (!currentActive.websiteData.potentialDistraction) {
      session.save();
    }

    console.log(session.storage.get(currentActive.websiteData.url));
    // if (!currentActive.websiteData.potentialDistraction) {
    //   session.save();
    // }
  } // handle whitelist

  // let  newActive: Active;

  // if (url && !session.whitelist.includes(url)) {
  //   if (session.storage.has(url)) {
  //     let newActive = session.storage.get(url);
  //     session.setActive(newActive);
  //     // I should send reminder if i spend too much time on this page.
  //   } else {
  //     let newActive = new Active({
  //       url,
  //       timeSpent: 0,
  //       potentialDistraction: true,
  //     });
  //     session.storage.set(url, newActive);
  //     session.setActive(newActive);
  //     chrome.alarms.create(url, { periodInMinutes: 2 });
  //   }
  // }

  startTracking(url);

  // session.setActive(newActive);

  // if (session.isDistractionURL(url)) {
  //   session.setActiveFromURL(url);
  // } else {

  //   // session.setActive(
  //   //   new Active({ url, timeSpent: 0, potentialDistraction: true })
  //   // );
  //   // create an alarm to check if at 30 minuites
  //
  //   //
  // }
}

chrome.windows.onFocusChanged.addListener(async (id) => {
  // console.log(`Focused changed ${id === chrome.windows.WINDOW_ID_NONE}`
  console.log('here')
  if (id === chrome.windows.WINDOW_ID_NONE) {
    console.log('here')
    const currentActive = session.getActive();
    if (currentActive) {
      currentActive.endTracking();
      console.log('Here');
      
      // this makes sure that only changed distractions are saved and that it is not saved any time the tab is changed, but only then it is a distraction
      if (!currentActive.websiteData.potentialDistraction) {
        session.save();
      }
    }
  } else {
    const url = await getURL();
    startTracking(url);
  }

})

// chrome.windows.onFocusChanged.addListener(async (windowID) => {
//   const currentActive = session.getActive();
//   if (currentActive && windowID === chrome.windows.WINDOW_ID_NONE) {
//     currentActive.endTracking();
//   } else {
//     let url = await common.getActiveTabURL();
//     url = common.getHostDomain(url);

//     if (!session.whitelist.includes(url)) {
//       if (session.storage.has(url)) {
//         // can be wither a distraction
//         let newActive = session.storage.get(url);
//         session.setActive(newActive);
//         // I should send reminder if i spend too much time on this page.
//       } else {
//         let newActive = new Active({
//           url,
//           timeSpent: 0,
//           potentialDistraction: true,
//         });
//         session.storage.set(url, newActive);
//         session.setActive(newActive);
//         chrome.alarms.create(url, { periodInMinutes: 2 });
//       }
//     }
//   }
// });

chrome.storage.onChanged.addListener((changes) => {
  // sync changes with session.distractions();
  // changes.distractions
});

chrome.runtime.onInstalled.addListener((details) => {
  // if (details.reason == "install") {
  common.setInitalData();

  // set inital values for storage items
  // open options page???
  // chrome.runtime.openOptionsPage()

  // chrome.runtime.getURL()
  // chrome.tabs.create()
  // }
});

chrome.notifications.onButtonClicked.addListener((url, index) => {
  if (index == 0) {
    // session.addDistraction(url);
    let currentActive: Active; // use a variable
    if (url === session.getActive()?.websiteData?.url) {
      currentActive = session.getActive();
    } else {
      currentActive = session.storage.get(url);
    }
    // do i need to check
    console.log(currentActive);
    delete currentActive.websiteData.potentialDistraction;
    // should i save???
  } else {
    session.addToWhitelist(url);
  }

  // chrome.notifications.clear(url); // do i need this?
});

// chrome.runtime.onStartup

// In popup

chrome.tabs.onActivated.addListener(async () => {
  console.log('Activated')

  await track();
});

// chrome.runtime.onMessage.addListener((message, sender) => {
//   const currentActive = session.getActive();
//   const { event, url }: { event: MessageEvent; url: string } = message;
//   if (event == "pageblur") {
//     currentActive.endTracking();

//     if (!currentActive.websiteData.potentialDistraction) {
//       session.save();
//     }
//   } else if (event == "pagefocus") {
//     if (session.isDistractionURL(url)) {
//       session.setActiveFromURL(url);
//     } else {

//       session.setActive(
//         new Active({ url, timeSpent: 0, potentialDistraction: true })
//       );
//       // create an alarm to check in 30mins
//       chrome.alarms.create(url, { periodInMinutes: 30 });
//       //
//     }
//   }
// });

chrome.alarms.onAlarm.addListener(({ name: urlAlarm }) => {

  // if the alarm is not cancled, then we are still on this website (only canceled in the active.endTracking())
  // const currentActive = session.getActive();
  console.log("Alarm", urlAlarm);

  chrome.notifications.create(urlAlarm, {
    type: "basic",
    iconUrl: "../icons/TimeManagerLogoTrans2.png",
    title: `You have spent a lot of time on ${urlAlarm}`, // You have spent about 30mins
    message: "Would you like us to add this website as a distraction?",
    buttons: [{ title: "Add website" }, { title: "Whitelist website" }],
  });
  console.log('notification created');

});

chrome.tabs.onUpdated.addListener(async (id, info) => {

  if (info?.url) {
    console.log("updated");
    await track(info?.url);
  }
});
