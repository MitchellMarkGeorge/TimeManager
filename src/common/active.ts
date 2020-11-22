import { Time } from './time';
import { WebsiteData } from './types';

export class Active {
    private startTime: number = 0; // this might be a bug
    // dailyUsage: number;
    // public sessionTimeSpent: number = 0; // in hours - might not need this
    constructor(public websiteData: WebsiteData) {
      // this.startTime = startTime;
  
      // think about this (use in background sctript)
    }
  
    get isDistraction() {
      return !this.websiteData.potentialDistraction;
    }
  
    // constructor(url: string) {}
  
    // updateSessionTimeSpent() {
    //   // what side effects could this have
    //   this.sessionTimeSpent = this.getTime(Date.now() - this.startTime).inHours();
    // }
  
    startTracking() {
      
  
      //THIS THE THE BEGINING OF THE TIME SPENT ON THAT TAB/ THE TAB URL IS UPDATED/ WINDOW IS FOCUSED IN (ESSENTIOALLY A NEW TAB SESSION) , NOT OVERALL
      // THIS IS BECAUSE IT IS SET EVERYTIME setTracking() IS CALLED
    
      this.startTime = Date.now(); // this changes everytime it is activated (meaning everytime a new tab is changed) or updade or window is changed
      // only for potential distractions - MIGHT CHANGE
      // different notification for distractions
  
      const { url, potentialDistraction} = this.websiteData;
  
      if (potentialDistraction) {
        chrome.alarms.create(url, { when: this.startTime + Time.minInMilliseconds(2) }); // alarm should be called n minuites later  // 10 minuites or 15
      } // should this only be called once
      
      console.log(`Tracking ${url}`)
    }
  
    getTime(milliseconds: number) {
      return new Time(milliseconds);
    }
  
    getStartTime() {
      return this.startTime;
    }
  
  
    endTracking() {
      // should have protection that startTracking() is called
      const endTime = Date.now();
      // IN HOURS WITH 2 DECIMAL POINTS
      // const timeSpent = parseFloat(
      //   (endTime - this.startTime / (1000 * 60 * 60)).toFixed(2)
      // );
  
      const timeSpent = this.getTime(endTime - this.startTime).inHours();
      console.log(timeSpent);
      this.websiteData["timeSpent"] += timeSpent;
      // this.sessionTimeSpent += (this.sessionTimeSpent - timeSpent); // in hours - might not need this
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