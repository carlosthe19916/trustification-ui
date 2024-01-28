import React from "react";

import { Flex, FlexItem } from "@patternfly/react-core";
import ShieldIcon from "@patternfly/react-icons/dist/esm/icons/shield-alt-icon";

import { RHSeverity } from "@app/api/models";

import {
  global_info_color_100 as lowColor,
  global_warning_color_100 as moderateColor,
  global_danger_color_100 as importantColor,
  global_palette_purple_400 as criticalColor,
} from "@patternfly/react-tokens";

type ListType = {
  [key in RHSeverity]: {
    color: { name: string; value: string; var: string };
  };
};
const severityList: ListType = {
  low: {
    color: lowColor,
  },
  moderate: {
    color: moderateColor,
  },
  important: {
    color: importantColor,
  },
  critical: {
    color: criticalColor,
  },
};

interface RHSeverityShieldProps {
  value: RHSeverity;
}

export const RHSeverityShield: React.FC<RHSeverityShieldProps> = ({
  value,
}) => {
  let severityProps = severityList[value];

  return (
    <Flex
      spaceItems={{ default: "spaceItemsXs" }}
      alignItems={{ default: "alignItemsCenter" }}
      flexWrap={{ default: "nowrap" }}
      style={{ whiteSpace: "nowrap" }}
    >
      <FlexItem>
        <ShieldIcon color={severityProps.color.value} />
      </FlexItem>
      <FlexItem>{value.charAt(0).toUpperCase() + value.slice(1)}</FlexItem>
    </Flex>
  );
};
