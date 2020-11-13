import { getDistractions, loadData } from "./common";

export class Time {
  constructor(private milliseconds: number) {}
  static hoursInMinuites(hours: number) {
    return Math.floor(hours * 60);
  }
  inMinuites() {
    return parseFloat((this.milliseconds / (1000 * 60)).toFixed(4));
  }
  inHours() {
    return parseFloat((this.milliseconds / (1000 * 60 * 60)).toFixed(4));
  }
  inSeconds() {
    return parseFloat((this.milliseconds / 1000).toFixed(4));
  }

  // what is i want to go from hours to millseconods/minuites
}

export interface LoadDataResult {
  distractions: typeof DEFAULT_DATA;
  whitelist: string[];
}

export interface WebsiteData {
  url: string;
  potentialDistraction?: boolean;
  timeSpent: number; // in hours
}

export type MessageEvent = "pagefocus" | "pageblur" | "pagetimeout";

export class Active {
  private startTime: number;

  constructor(public websiteData: WebsiteData) {}

  // constructor(url: string) {}

  startTracking() {
    this.startTime = Date.now();
    console.log(`Tracking ${this.websiteData.url}`)
  }

  getTime(milliseconds: number) {
    return new Time(milliseconds);
  }

  getStartTime() {
    return this.startTime;
  }

  endTracking() {
    const endTime = Date.now();
    // IN HOURS WITH 2 DECIMAL POINTS
    // const timeSpent = parseFloat(
    //   (endTime - this.startTime / (1000 * 60 * 60)).toFixed(2)
    // );

    const timeSpent = this.getTime(endTime - this.startTime).inHours();
    console.log(timeSpent);
    this.websiteData["timeSpent"] += timeSpent;
    console.log(
      `Time spent on ${this.websiteData.url}: ${this.websiteData.timeSpent} hours`
    );
    if (this.websiteData.potentialDistraction) {
      chrome.alarms.clear(this.websiteData.url);
      

    }

    // should i do this for all links
    // for distraction websites, should I send notifications if they spent a lot of time

    // if (this.websiteData.potentialDistraction) {
    //   // chrome.alarms.clear(this.websiteData.url);
    //   const { url } = this.websiteData;
    //   const timeSpentInMins = Time.hoursInMinuites(timeSpent);
    //   // can be 0??
    //   if (timeSpentInMins && timeSpentInMins >= 15) {
    //     showTimeSpentNotification(url);
    //     //}
    //   }
    // }
  }
}

export interface SessionState {}

export class Session {
  private active: Active;
  public storage: Map<string, Active>;
  potentialDistractions: WebsiteData[];
  // districtions: DistractionURL[]
  constructor(distractions: typeof DEFAULT_DATA, public whitelist: string[]) {
    this.storage = new Map<string, Active>();
    for (let key of Object.keys(distractions)) {
      this.storage.set(key, new Active(distractions[key]));
    }
  }

  static async init() {
    // const distractions = await getDistractions();

    const { distractions, whitelist } = await loadData();
    return new Session(distractions, whitelist);
  }

  save() {
    // const distractionIndex = this.distractions.indexOf(this.active.websiteData);
    // //if the active is a distraction
    // if (distractionIndex !== -1) {
    //   this.distractions[distractionIndex] = this.active.websiteData;
    //   chrome.storage.local.set({ distractions: this.distractions });
    // }
    // //else {
    // //     this.distractions.push(this.active.websiteData);
    // // }

    let obj = Object.create(null);
    // for (let [k, v] of this.storage.entries()) {
    //   // We don’t escape the key '__proto__'
    //   // which can cause problems on older engines
    //   obj[k] = v;
    // }

    this.storage.forEach((value, key) => {
      if (!value.websiteData.potentialDistraction) {
        obj[key] = value.websiteData;
      }
    })

    console.log('Saved:', obj);
    

    
    // return obj;
    chrome.storage.local.set({ distractions: obj });
  }

  addToWhitelist(url: string) {
    this.storage.delete(url);
    this.whitelist.push(url);
    chrome.storage.local.set({ whitelist: this.whitelist });
  }

  // setActiveFromURL(url: string) {
  //   const foundWebsiteData = this.distractions.find((website) => {
  //     website.url === url;
  //   });

  //   if (foundWebsiteData) {
  //     this.setActive(new Active(foundWebsiteData));
  //   }
  // }

  // addDistraction(url: string) {
  //   let newDistraction: WebsiteData;
  //   if (this.active.websiteData.url == url) {
  //     delete this.active.websiteData.potentialDistraction;
  //     newDistraction = this.active.websiteData;
  //   } else {
  //     // assume they have spent 30 minnutes on the website (0.5 hours)
  //     newDistraction = { url, timeSpent: 0.5 };
  //   }

  //   this.distractions.push(newDistraction);
  //   // use the save method
  //   chrome.storage.local.set({ distractions: this.distractions });
  // }

  getActive() {
    return this.active;
  }

  isDistractionURL(url: string) {
    // return this.distractions.some((website) => website.url == url);

    return !this.storage.get(url).websiteData.potentialDistraction;
  }

  setActive(active: Active) {
    this.active = active;
    this.active.startTracking();
    //save??
  }
}

export const DEFAULT_DATA: { [key: string]: WebsiteData } = {
  "instagram.com": {
    url: "instagram.com",
    timeSpent: 0,
  },

  "youtube.com": {
    url: "youtube.com",
    timeSpent: 0,
  },

  "reddit.com": {
    url: "reddit.com",
    timeSpent: 0,
  },

  "pinterest.ca": {
    url: "pinterest.ca",
    timeSpent: 0,
  },

  "twitter.com": {
    url: "twitter.com",
    timeSpent: 0,
  },

  "facebook.com": {
    url: "facebook.com",
    timeSpent: 0,
  },
};
