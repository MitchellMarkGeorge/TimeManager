import { DEFAULT_DATA, LoadDataResult } from "./types";

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

// do i need to export it
export const LOCKDOWN_URL = getHostDomain(
  chrome.runtime.getURL("../content/content.html")
);

export const STATISTICS_URL = getHostDomain(
  chrome.runtime.getURL("../options/options.html")
);

export function loadData(): Promise<LoadDataResult> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(
      ["distractions", "whitelist", "startDate"],
      (result) => {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError);
          return reject(chrome.runtime.lastError);
        }
        // const distractions = result.distractions || [];

        return resolve(
          <LoadDataResult>result || {
            distractions: DEFAULT_DATA,
            whitelist: [],
          }
        );
      }
    );
  });
}

export function getActiveTabURL(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (result) => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
      return resolve(result[0]?.url || "");
    });
  });
}

export async function getURL(initalURL?: string) {
  let url: string;
  if (initalURL) {
    url = initalURL;
  } else {
    url = await getActiveTabURL();
  }

  url = getHostDomain(url);

  return url;
}

export function getLockdownURL(distractionURL: string, time: number, originalUrl) {
  let url = new URL(chrome.runtime.getURL("../content/content.html"));
  url.searchParams.set("url", distractionURL);
  url.searchParams.set("endTimeInLockdown", time.toString());
  url.searchParams.set("originalUrl", originalUrl)

  return url.toString();
}

export function getTabURLandID(): Promise<{ url: string; id: number, originalUrl: string }> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (result) => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
      return resolve({
        originalUrl: result[0]?.url || "",
        url: result[0]?.url ? getHostDomain(result[0]?.url) : "",
        id: result[0]?.id || -1,
      });
    });
  });
}

export function setInitalData(): void {
  // this automatically whitelists the lockdown page and statistics page so they are not tracked
  chrome.storage.local.set({
    distractions: DEFAULT_DATA,
    whitelist: ["newtab", "extensions", "google.com", LOCKDOWN_URL, STATISTICS_URL],
  });
}
