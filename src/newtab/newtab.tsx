import { Heading, Text, Link, TextInput, SearchInput } from "evergreen-ui";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import Box from "ui-box";
import { Time } from "../common/time";

import "./newtab.css";

interface State {
  currentTime?: string;
  inputValue?: string;
}

export class Newtab extends Component<{}, State> {
  state: State = { inputValue: "" };
  intervalID?: number;

  componentDidMount() {
    this.setState({ currentTime: this.getCurrentTime() }, () => {
      this.intervalID = setInterval(() => {
        //   console.log('here')
        this.setState({ currentTime: this.getCurrentTime() }),
          Time.minInMilliseconds(1);
      });
    });
  }

  componentWillUnmount() {
    clearInterval(this.intervalID);
  }

  onKeyPress = (event) => {
    if (event.key === "Enter") {
      window.open("https://google.com/search?q=" + this.state.inputValue, '_self');
    }
  };

  onChange = (event) => {
    this.setState({ inputValue: event.target.value });
  };

  getCurrentTime = () => {
    // console.log(new Date().toLocaleDateString());
    const now = new Date(); // (am/ pm)
    // this handles 24 hourtime -> 13 - 1pm
    let hour = now.getHours() > 12 ? now.getHours() - 12 : now.getHours();

    let mins: string | number = now.getMinutes();

    if (mins < 10) {
      mins = "0" + mins;
    }

    return `${hour}:${mins}`;
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
          <Heading
            // size={900}
            is="h1"
            fontSize="8rem" 
            fontWeight="bold"
            color="#47B881"
            marginBottom="1rem"
            lineHeight="initial"
          >
            {this.state.currentTime}
          </Heading>

          <Box textAlign="center" marginBottom="1rem">
            <SearchInput
              autoFocus
              textAlign="center"
              value={this.state.inputValue}
              height={60}
              width={400}
              onChange={this.onChange}
              placeholder="Search Here"
              onKeyPress={this.onKeyPress}
            />
          </Box>

          {/* search bar */}
          <Text color="muted" fontSize="1rem">
            Have a productive day! {/* might make random phrase */}
            <Link
              textDecoration="none"
              color="green"
              target="_blank"
              href={chrome.runtime.getURL("../options/options.html")}
            >
              See your stats.
            </Link>
          </Text>
        </Box>
      </Box>
    );
  }
}

ReactDOM.render(<Newtab />, document.getElementById("root"));
