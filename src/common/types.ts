export interface LoadDataResult {
  distractions: typeof DEFAULT_DATA;
  whitelist: string[];
}

export interface WebsiteData {
  url: string;
  potentialDistraction?: boolean;
  timeSpent: number; // in hours - does this have to be in hours??? Can it be in mins???
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
