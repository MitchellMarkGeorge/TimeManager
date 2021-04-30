import { Heading, Paragraph } from "evergreen-ui";
import React, { Component } from "react";
import * as ReactDOM from "react-dom";
import { DEFAULT_DATA } from "../common/types";
import "./options.css";
import * as common from "../common/common";
import Box from "ui-box";
import { Doughnut } from "react-chartjs-2";

/**
 * I might use this page to let users manually add items to whitelist/ blacklist
 * or to switch off distraction learning
 *
 * Should have ability to change defaults
 *
 *
 */

interface State {
  distractions?: typeof DEFAULT_DATA;
  whitelist?: boolean;
  data?: any;
  websiteNames?: string[];
}

export default class Options extends Component {
  state: State = {};

  componentDidMount() {
    common.loadData().then(({ distractions }) => { // get info from background script???
      this.setState({
        websiteNames: Object.keys(distractions), // e.g ["instagram", "facebook"]
        data: Object.values(distractions).map((value) =>
          Math.floor(value.timeSpent)
        ),
      });
    });
  }

  getData = () => {
    return {
      labels: this.state.websiteNames,
      datasets: [
        {
          data: this.state.data,
          backgroundColor: Array.from(
            { length: this.state.websiteNames.length },
            () => this.dynamicColors()
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  dynamicColors =  () => {
    let r = Math.floor(Math.random() * 255);
    let g = Math.floor(Math.random() * 255);
    let b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
  };

  render() {
    if (!this?.state?.websiteNames?.length) {
      return <Heading>Loading...</Heading>;
    }
    return (
      <Box position="relative" height="100%" width="100%">
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
        >
          <Heading
            size={900}
            color="#47B881"
            marginBottom="1rem"
            fontWeight="bold"
          >
            Statistics
          </Heading>

          <Paragraph marginBottom="1rem" color="muted" fontSize="1rem">
            Here you will see the stats of the time spent on each distraction (in hours).
          </Paragraph>

          <Doughnut
            width={500}
            height={300}
            // options={{ maintainAspectRatio: false }}
            type="doughnut"
            data={this.getData()}
          />
        </Box>
      </Box>
    );
  }
}

ReactDOM.render(<Options />, document.getElementById("root"));
