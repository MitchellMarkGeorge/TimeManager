import { Active } from './active';
import { WebsiteData, DEFAULT_DATA } from './types';

import { loadData } from './common';





export class Session {
    private active: Active;
    public storage: Map<string, Active>;
    potentialDistractions: WebsiteData[];
    public inLockDown = false // for 30mins/ no distraction websites are allowed
    // districtions: DistractionURL[]
    public endTimeInLockdown: number // this is the time the lockdown will end
    constructor(distractions: typeof DEFAULT_DATA, public whitelist: string[]) {
      this.storage = new Map<string, Active>(); // need to handle no data
      for (let key of Object.keys(distractions)) {
        this.storage.set(key, new Active(distractions[key]));
      }
    }
  
    static async init() {
      // const distractions = await getDistractions();
      // most websites are tracked by session (ie: the time from when the browser is open to then it is closed)
      // This means that after the browser is closed, most siteds will be tracked anew
      // the only data/ tracking that is saved are the time spent on distraction pages and the whitelist
      const { distractions, whitelist } = await loadData();
      return new Session(distractions, whitelist);
    }
  
    isWhitlistURL(url: string) {
      return this.whitelist.includes(url);
    }
  
    removeFromWhitelist(url: string) {
      const index = this.whitelist.indexOf(url);;
      if (index > -1) {
        this.whitelist.splice(index, 1);
      }
  
      
  
      
  
  
      chrome.storage.local.set({ whitelist: this.whitelist });
  
      return new Active({ url, potentialDistraction: true, timeSpent: 0}) // think about time spent
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
  
      // let obj = Object.create(null);
      // // for (let [k, v] of this.storage.entries()) {
      // //   // We don’t escape the key '__proto__'
      // //   // which can cause problems on older engines
      // //   obj[k] = v;
      // // }
  
      // this.storage.forEach((value, key) => {
      //   if (!value.websiteData.potentialDistraction) {
      //     obj[key] = value.websiteData;
      //   }
      // })
  
      // console.log('Saved:', obj);
      const obj = this.storageToJSON();
  
      
      // return obj;
      chrome.storage.local.set({ distractions: obj });
    }
  
    storageToJSON() {
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
  
      return obj;
    }
  
    addToWhitelist(url: string) {
      this.setActive(null);
      this.storage.delete(url);
      this.whitelist.push(url);
      chrome.storage.local.set({ whitelist: this.whitelist });
    }
  
    removeDistraction() {
      const currentActive = this.active;
      delete currentActive.websiteData.potentialDistraction;
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
  
    // isDistractionURL(url: string) {
    //   // return this.distractions.some((website) => website.url == url);
  
    //   return !this.storage.get(url).websiteData.potentialDistraction;
    // }
  
    isDistraction(active?: Active) {
      // if active is not given, get the current one. Else, use the given
      const currentActive = active ? active : this.getActive();
  
      return !currentActive.websiteData.potentialDistraction;
  
    }
  
    setActive(active: Active) {
      this.active = active;
    }
  }