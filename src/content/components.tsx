import { ErrorIcon, Heading, Text } from "evergreen-ui";
import React from "react";
import Box from "ui-box";

import './content.css'

interface Props {
  url: string;
}

// export  class LockdownComponent extends Component<Props, {}> {
//     render() {
//         return (
//             <div>

//             </div>
//         )
//     }
// }

export const LockdownComponent = (props: Props) => {
  return (
    // <div>
    //     Uh-oh! You cant access {props.url} in Lockdown.
    //     {/* get time til lockdown ends */}
    // </div>

    <Box position="relative" height="100%" width="100%">
      <Box
        position="absolute"
        top="50%"
        left="50%"
        color="#47B881"
        transform="translate(-50%, -50%)"
      >
        <Heading size={900} fontWeight="bold" color="#47B881" marginBottom="16px">
          Uh-oh!
        </Heading>
        {/* <ErrorIcon textAlign="center" marginTop="16px" marginBottom="16px" color="danger" size={40} /> */}
        <Text color="muted">
          You can't access {props.url} in Lockdown Mode. You have *time*
          left before you can use this site.
        </Text>
      </Box>
    </Box>
  );
};
