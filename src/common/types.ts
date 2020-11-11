
import { getDistractions, loadData } from "./common";

export class Time {
  constructor(private milliseconds: number) {}
  inMinuites() {
    return parseFloat((this.milliseconds / (1000 * 60)).toFixed(2));
  }
  inHours() {
    return parseFloat((this.milliseconds / (1000 * 60 * 60)).toFixed(2));
  }
  inSeconds() {
    return parseFloat((this.milliseconds / 1000).toFixed(2));
  }

  // what is i want to go from hours to millseconods/minuites
}

export interface LoadDataResult {
    distractions: WebsiteData[],
    whitelist: string[]
}

export interface WebsiteData {
  url: string;
  potentialDistraction?: boolean;
  timeSpent: number; // in ours
}

export type MessageEvent = "pagefocus" | "pageblur" | "pagetimeout"

export class Active {
  private startTime: number;

  constructor(public websiteData: WebsiteData) {}

  // constructor(url: string) {}

  startTracking(state?: SessionState) {
    this.startTime = Date.now();
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

    const timeSpent = this.getTime(endTime - this.startTime).inHours()
    this.websiteData.timeSpent += timeSpent;

    if (this.websiteData.potentialDistraction) {
      chrome.alarms.clear(this.websiteData.url);
    }
  }
}

export interface SessionState {}

export class Session {
  private active: Active;
  public state: SessionState;
  potentialDistractions: WebsiteData[];
  // districtions: DistractionURL[]
  constructor(public distractions: WebsiteData[], public whitelist: string[]) {}

  static async init() {
    // const distractions = await getDistractions();

    const { distractions, whitelist } = await loadData();
    return new Session(distractions, whitelist);
  }

  save() {
    const distractionIndex = this.distractions.indexOf(this.active.websiteData);
    //if the active is a distraction
    if (distractionIndex !== -1) {
      this.distractions[distractionIndex] = this.active.websiteData;
      chrome.storage.local.set({ distractions: this.distractions });
    }
    //else {
    //     this.distractions.push(this.active.websiteData);
    // }
  }

  addToWhitelist(url: string) {

      this.whitelist.push(url);
      chrome.storage.local.set({ distractions: this.whitelist });
  }

  setActiveFromURL(url: string) {
    const foundWebsiteData = this.distractions.find((website) => {
      website.url === url;
    });

    if (foundWebsiteData) {
      this.setActive(new Active(foundWebsiteData));
    }
  }

  addDistraction(url: string) {
    let newDistraction: WebsiteData;
    if (this.active.websiteData.url == url) {
        newDistraction = this.active.websiteData;
    } else {
        // assume they have spent 30 minnutes on the website (0.5 hours)
        newDistraction = { url, timeSpent: 0.5}
    }

    this.distractions.push(newDistraction);
    // use the save method
    chrome.storage.local.set({ distractions: this.distractions });
  }

  getActive() {
    return this.active;
  }

  isDistractionURL(url: string) {
    return this.distractions.some((website) => website.url == url);
  }

  setActive(active: Active) {
    this.active = active;
    this.active.startTracking();
    //save??
  }
}

export const DEFAULT_DATA: WebsiteData[] = [
  {
    url: "instagram.com",
    timeSpent: 0,
  },

  {
    url: "youtube.com",
    timeSpent: 0,
  },

  {
    url: "reddit.com",
    timeSpent: 0,
  },

  {
    url: "pinterest.ca",
    timeSpent: 0,
  },

  {
    url: "twitter.com",
    timeSpent: 0,
  },

  {
    url: "facebook.com",
    timeSpent: 0,
  },
];
