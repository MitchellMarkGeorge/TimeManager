import { Checkbox, Heading, Paragraph, Button } from "evergreen-ui";
import React, { Component } from "react";
import * as ReactDOM from "react-dom";
import Box from "ui-box";

import { WebsiteData } from "../common/types";
import { Time } from "../common/time";
import logo from "../icons/logo.png";
import "./popup.css";

// BACKGROUND PAGE IS THE SOURCE OF TRUTH FOR ALL INFOMATION/ DATA

interface ActiveProps {
  startTime: number;
  websiteData: WebsiteData;
  sessionTimeSpent: number;
}

interface State {
  active?: ActiveProps;
  isWhitlistURL?: boolean;
  inLockdown?: boolean;
  endTimeInLockdown?: number; // the actual end time of the lockdown (in milliseconds)
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
    let { timeSpent } = this.state.active.websiteData; // is in hours -> from saved
    console.log(timeSpent);
    const { startTime } = this.state.active;
    let currentTimeSpent: Time;
    // if startTime is 0, tracking has not started

    // this gets the time spent from the time tracking started till now
    if (startTime > 0) {
      currentTimeSpent = new Time(Date.now() - startTime);
    } else {
      currentTimeSpent = new Time(0);
    }

    console.log(startTime);
    const timeSpentInMins = Math.floor(
      Time.hoursInMinuites(timeSpent) + currentTimeSpent.inMinuites()
    ); // converts time to minuites (rounded) included
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
    // BACKGROUND SCRIPT SHOULD BE SOURCE OF TRUTH
    // This might be the only exception, as no "real" data is altered
    // creates a copy of the acive object in order to manipulate it
    let activeCopy = Object.assign({}, this.state.active);
    if (!this.state.active.websiteData.potentialDistraction) {
      // meaning it is a distraction
      chrome.runtime.sendMessage({ request: "popup-remove-distraction" });
      activeCopy.websiteData.potentialDistraction = true;
      // this.setState({ active: activeCopy });
    } else {
      chrome.runtime.sendMessage({ request: "popup-add-distraction" });
      delete activeCopy.websiteData.potentialDistraction;
      // this.setState({ active: activeCopy });
    }

    this.setState({ active: activeCopy });
  };

  changeWhitelist = () => {
    // is currently a whitelist url, being clicked means that it the user wants to remove it
    // otherwise, they want to add it
    if (this.state.isWhitlistURL) {
      chrome.runtime.sendMessage(
        // get url using common????
        { request: "popup-remove-whitelist" },
        (response) => {
          // this will include a new active that does the tracking
          this.setState({ ...response, isWhitlistURL: false });
        }
      );
      
    } else {
      chrome.runtime.sendMessage({
        request: "popup-add-whitelist",
        url: this.state.active.websiteData.url,
      });
      this.setState({ isWhitlistURL: true });
    }
  };

  goIntoLockdown = () => {
    chrome.runtime.sendMessage({ request: "popup-lockdown" }, (response) => {
      this.setState({ ...response });
    });
  };

  getPopupText = () => {
    if (this?.state?.isWhitlistURL) {
      return "This site is whitelisted."; //
    } else if (this.state.active) {
      return `You have spent ${this.getTimeAsString()} on ${
        this.state.active.websiteData.url
      }.`;
    } else if (!this.state.active && this.state.inLockdown) {
      return "This is in lockdown";
    } else {
      return "Loading...";
    }
  };

  timeLeftInLockdown = () => {
    let timeLeftInLockdown = new Time(
      this?.state?.endTimeInLockdown - Date.now()
    ).inMinuites();
    timeLeftInLockdown = Math.floor(timeLeftInLockdown);
    return timeLeftInLockdown;
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
          <Heading
            size={600}
            fontWeight="bold"
            color="#47B881"
            maxWidth="200px" // these styles truncate the heading if it becomes too long (probably caused by the url)
            // https://stackoverflow.com/questions/33058004/applying-an-ellipsis-to-multiline-text
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {this.getPopupText()}
          </Heading>

          <Paragraph marginTop="16px" color="muted">
            Here are your options:
          </Paragraph>
          {/* cant edit distractions while in lockdown */}
          {!this.state.isWhitlistURL &&
            this.state.active &&
            !this.state.inLockdown && (
              <Checkbox
                label="Distractions"
                checked={!this.state.active.websiteData.potentialDistraction}
                onChange={this.changeDistractions}
              />
            )}
          {/* should the user be able to edite whitelist in lockdown? */}

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

          {this?.state?.inLockdown && this?.state?.endTimeInLockdown && (
            <Paragraph color="muted" marginTop="16px">
              Time left in lockdown: {this.timeLeftInLockdown() || ">1"}m
            </Paragraph>
          )}
        </Box>
      </Box>
    );
  }
}

ReactDOM.render(<Popup />, document.getElementById("root"));
