import React from "react";

import {
  Label,
  LabelProps,
  Progress,
  ProgressProps,
} from "@patternfly/react-core";

import { BaseSeverity } from "@app/api/models";

type BaseSeverityListType = {
  [key in BaseSeverity]: {
    label: string;
    progressProps: Pick<ProgressProps, "variant">;
    labelProps: LabelProps;
  };
};
const baseSeverityList: BaseSeverityListType = {
  NONE: {
    label: "None",
    progressProps: { variant: undefined },
    labelProps: { color: "grey" },
  },
  LOW: {
    label: "Low",
    progressProps: { variant: undefined },
    labelProps: { color: "orange" },
  },
  MEDIUM: {
    label: "Medium",
    progressProps: { variant: "warning" },
    labelProps: { color: "orange" },
  },
  HIGH: {
    label: "High",
    progressProps: { variant: "danger" },
    labelProps: { color: "red" },
  },
  CRITICAL: {
    label: "Critical",
    progressProps: { variant: "danger" },
    labelProps: { color: "purple" },
  },
};

const severityFromScore = (score: number): BaseSeverity => {
  if (score >= 9.0) {
    return "CRITICAL";
  } else if (score >= 7.0) {
    return "HIGH";
  } else if (score >= 4.0) {
    return "MEDIUM";
  } else if (score >= 0.1) {
    return "LOW";
  } else {
    return "NONE";
  }
};

interface SeverityRendererProps {
  variant: "label" | "progress";
  score: number;
  severity?: BaseSeverity;
}

export const SeverityRenderer: React.FC<SeverityRendererProps> = ({
  variant,
  score,
  severity,
}) => {
  let severityType = severity || severityFromScore(score);

  if (variant == "label") {
    return (
      <Label {...baseSeverityList[severityType].labelProps}>{score}</Label>
    );
  } else {
    return (
      <Progress
        aria-labelledby="severity-renderer"
        size="sm"
        max={10}
        value={score}
        label={`${score}/10`}
        {...baseSeverityList[severityType].progressProps}
      />
    );
  }
};
