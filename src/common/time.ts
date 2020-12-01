export class Time {
    constructor(private milliseconds: number) {}
    static hoursInMinuites(hours: number) {
      return Math.floor(hours * 60);
    }
  
    static minInMilliseconds(mins: number) {
      return Math.floor(mins * 60 * 1000); // should i floor it/
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