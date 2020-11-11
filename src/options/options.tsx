import { Heading, Paragraph, Checkbox } from "evergreen-ui";
import React, { Component } from "react";
import * as ReactDOM from "react-dom";
import { DEFAULT_DATA } from "../common/types";
import "./options.css";
import * as common from '../common/common';
/**
 * I might use this page to let users manually add items to whitelist/ blacklist
 * or to switch off distraction learning
 * 
 * Should have ability to change defaults
 * 
 * 
 */

interface State {

    websites?: typeof DEFAULT_DATA
  isLoading: boolean;
  learnDistraction?: boolean;
}

export default class Options extends Component {
  state: State = {isLoading: true };

//   async componentDidMount() {

//     const destractions = await common.getDestractions();

//     if (destractions.length > 0) {

//     }
    
//   }

 

  render() {
    return (
      <div className="container">
        <Heading color="#47B881" size={900}>
          Options
        </Heading>

        
          <Paragraph marginTop="default" color="muted">
            No thing to see here yet!
          </Paragraph>
        
      </div>
    );
  }
}

ReactDOM.render(<Options />, document.getElementById("root"));
