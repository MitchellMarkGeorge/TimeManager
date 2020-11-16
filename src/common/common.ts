import { WebsiteData, DEFAULT_DATA, LoadDataResult } from "./types";

export function getHostDomain(url: string): string {
  let domain: string;
  //find & remove protocol (http, ftp, etc.) and get domain
  if (url.indexOf("://") > -1) {
    domain = url.split("/")[2];
  } else {
    domain = url.split("/")[0];
  }
  //find & remove www
  if (domain.indexOf("www.") > -1) {
    domain = domain.split("www.")[1];
  }
  domain = domain.split(":")[0]; //find & remove port number
  domain = domain.split("?")[0]; //find & remove url params

  return domain;
}

export function getDistractions(): Promise<WebsiteData[]> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(["distractions"], (result) => {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError);
          return reject(chrome.runtime.lastError);
        }
        const distractions = result.distractions || []; 
     
        return resolve(distractions);
        
      });
    });
  
   
  }

  export function loadData(): Promise<LoadDataResult>  {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(["distractions", "whitelist"], (result) => {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError);
          return reject(chrome.runtime.lastError);
        }
        // const distractions = result.distractions || []; 
     
        return resolve(<LoadDataResult>result || {distractions: DEFAULT_DATA, whitelist: []});
        
      });
    });
  
   
  }

export function getActiveTabURL(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (result) => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
      return resolve(result[0]?.url || '');
    });
  });
}

export function setInitalData(): void {


  // set day extension is installed -> show how much time was spent on distractions from start date
  chrome.storage.local.set({ distractions: DEFAULT_DATA, startDate: Date.now(), whitelist: ["newtab", "extensions"]  });
}
