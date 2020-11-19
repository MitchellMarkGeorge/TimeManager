import { Checkbox, Heading, Paragraph, Button } from "evergreen-ui";
import React, { Component } from "react";
import * as ReactDOM from "react-dom";
import Box from "ui-box";
// import * as common from "../common/common";
import { Time, WebsiteData } from "../common/types";
import logo from "../icons/logo.png";
import "./popup.css";

interface ActiveProps {
  startTime: number;
  websiteData: WebsiteData;
  sessionTimeSpent: number;
}

interface State {
  active?: ActiveProps;
  // sessionTimeSpent?: number; // in hours
  isWhitlistURL?: boolean;
  inLockdown?: boolean; // remove option to add/ remove distraction in lockdown
  // for chart
}

class Popup extends Component<{}, State> {
  state: State = {};

  componentDidMount() {
    chrome.runtime.sendMessage({ request: "popup-load" }, (response) => {
      console.log(response); // use Active to get in "realtime (from the time the startTime till the time the popup was opened)" how much time user has they have spent on site
      // return normal object

      this.setState({ ...response });
    });
  }

  getTimeAsString = () => {
    let { timeSpent } = this.state.active.websiteData;
    console.log(timeSpent);
    const { startTime } = this.state.active;
    let currentTimeSpent: Time;
    // if startTime is 0, tracking has not srated
    if (startTime > 0) { // this might be the problem (or a symptom of a bigger one)
      currentTimeSpent = new Time(Date.now() - startTime);
    } else {
      currentTimeSpent = new Time(0);
    }
    
    console.log(startTime)
    const timeSpentInMins = Math.floor(
      Time.hoursInMinuites(timeSpent) + currentTimeSpent.inMinuites()
    ); // converts time to minuites (rounded)
    console.log(timeSpentInMins);

    if (timeSpentInMins <= 1) {
      return ">1m";
    }

    // if it is less than an hour, get the time spent in minuites (including the time spent from that current moment)
    if (timeSpentInMins < 60) {
      return `${timeSpentInMins}m`;
    } else {
      // otherwise, get the time in hrs and minuites:
      // https://www.w3resource.com/javascript-exercises/javascript-basic-exercise-51.php

      if (timeSpentInMins === 60) {
        return "1hr";
      }
      let hours = Math.floor(timeSpentInMins / 60);
      let minutes = timeSpentInMins % 60;
      return `${hours}hrs  ${minutes}m`;
    }
  };

  changeDistractions = () => {
    let activeCopy = Object.assign({}, this.state.active);
    if (!this.state.active.websiteData.potentialDistraction) {
      // meaning it is a distraction
      chrome.runtime.sendMessage({ request: "popup-remove-distraction" });
      activeCopy.websiteData.potentialDistraction = true;
      this.setState({ active: activeCopy });
    } else {
      chrome.runtime.sendMessage({ request: "popup-add-distraction" });
      delete activeCopy.websiteData.potentialDistraction;
      this.setState({ active: activeCopy });
    }
  };

  changeWhitelist = () => {
    // is currently a whitelist url, being clicked means that it the user wants to remove it
    // otherwise it is the opposite
    if (this.state.isWhitlistURL) {
      chrome.runtime.sendMessage(
        // get url using common????
        { request: "popup-remove-whitelist" },
        (response) => {
          // this will include a new active for that does the tracking
          this.setState({ ...response, isWhitlistURL: false });
        }
      );
      // this.setState({ isWhitlistURL: false}); // load the active
    } else {
      chrome.runtime.sendMessage({
        request: "popup-add-whitelist",
        url: this.state.active.websiteData.url,
      });
      this.setState({ isWhitlistURL: true });
    }
  };

  goIntoLockdown = () => {
    chrome.runtime.sendMessage({ request: "popup-lockdown" });
    this.setState({ inLockdown: true });
  };

  // getEmoji = () => {
  //   let { timeSpent } = this.state.active.websiteData;
  //   timeSpent = Time.timeSpent
  // }

  getText = () => {
    if (this?.state?.isWhitlistURL) {
      return "This site is whitelisted.";
    } else if (this.state.active) {
      return `You have spent ${this.getTimeAsString()} on ${
        this.state.active.websiteData.url
      }.`;
    } else if (!this.state.active && this.state.inLockdown) {
      return 'This is in lockdown'
    } else {
      return "Loading...";
    }
  };

  render() {
    

    return (
      <Box position="relative" height="100%" width="100%">
        <Box
          position="absolute"
          top="50%"
          left="50%"
          color="#47B881"
          transform="translate(-50%, -50%)"
        >
          <Box is="img" src={logo} height={40} width={40} marginBottom="16px" />
          <Heading size={600} fontWeight="bold" color="#47B881">
            {this.getText()}
          </Heading>

          <Paragraph marginTop="16px" color="muted">
            Here are your options:
          </Paragraph>

          {!this.state.isWhitlistURL && this.state.active && (
            <Checkbox
              label="Distractions"
              checked={!this.state.active.websiteData.potentialDistraction}
              onChange={this.changeDistractions}
            />
          )}
          <Checkbox
            label="Whitelist"
            checked={this.state.isWhitlistURL}
            onChange={this.changeWhitelist}
          />
          <Button
            disabled={this.state.inLockdown}
            appearance="primary"
            intent="danger"
            onClick={this.goIntoLockdown}
          >
            Lockdown Distractions
          </Button>
        </Box>
      </Box>
    );
  }
}

// const Active: React.FC<{ active: ActiveProps }> = ({ active }) => {
//   function getTimeAsString() {
//     let { timeSpent } = active.websiteData;
//     const { startTime } = active;
//     const currentTimeSpent = new Time(Date.now() - startTime);
//     let timeUnits: "hr" | "m";
//     // if it is less than an hour, get the time spent in minuites (including the time spent from that current moment)
//     if (timeSpent < 1) {
//       timeSpent +=
//         Time.hoursInMinuites(timeSpent) + currentTimeSpent.inMinuites();

//       timeUnits = "m";
//     } else {
//       // else,  , get the time spent in hours (including the time spent from that current moment)
//       timeSpent += currentTimeSpent.inHours();
//       timeUnits = "hr";
//     }

//     return `${Math.floor(timeSpent) || ">1"}${timeUnits}`;
//   }

//   return (
//     <Box position="relative" height="100%" width="100%">
//       <Heading position="absolute"
//             top="50%"
//             left="50%"
//             color="#47B881"
//             transform="translate(-50%, -50%)">
//         You have spent a total of <b>{getTimeAsString()}</b> on <b>{active.websiteData.url}</b> 😊
//       </Heading>
//     </Box>
//   );
// };

ReactDOM.render(<Popup />, document.getElementById("root"));
