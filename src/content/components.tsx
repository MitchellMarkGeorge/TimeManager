import { Heading, Text } from "evergreen-ui";
import React from "react";
import Box from "ui-box";

import './content.css'

interface Props {
  url: string;
  timeLeftInLockdown: number;
}

export const LockdownComponent = (props: Props) => {
  return (
 
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
      
        <Text color="muted">
          You can't access  <b>{props.url}</b> in Lockdown Mode. You have <b>{props.timeLeftInLockdown || '>1'}m</b> left before you can use this site.
        </Text>
      </Box>
    </Box>
  );
};
