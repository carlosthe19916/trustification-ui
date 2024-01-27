import React from "react";

import { BaseSeverity } from "@app/api/models";
import { useFetchAdvisoryById } from "@app/queries/advisories";
import {
  Bullseye,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  LabelProps,
  List,
  ListItem,
  Progress,
  ProgressProps,
  Spinner,
  Tooltip,
} from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import dayjs from "dayjs";
import { NavLink } from "react-router-dom";

type BaseSeverityListType = {
  [key in BaseSeverity]: {
    progressProps: Pick<ProgressProps, "title" | "variant">;
    labelProps: LabelProps;
  };
};
const baseSeverityList: BaseSeverityListType = {
  NONE: {
    progressProps: { title: "None", variant: undefined },
    labelProps: { color: "grey" },
  },
  LOW: {
    progressProps: { title: "Low", variant: undefined },
    labelProps: { color: "orange" },
  },
  MEDIUM: {
    progressProps: { title: "Medium", variant: "warning" },
    labelProps: { color: "orange" },
  },
  HIGH: {
    progressProps: { title: "High", variant: "danger" },
    labelProps: { color: "red" },
  },
  CRITICAL: {
    progressProps: { title: "Critical", variant: "danger" },
    labelProps: { color: "purple" },
  },
};

interface AdvisoryDetailsProps {
  id: string;
}

export const AdvisoryDetails: React.FC<AdvisoryDetailsProps> = ({ id }) => {
  const { advisory, isFetching } = useFetchAdvisoryById(id);

  if (isFetching) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  return (
    <>
      <Table aria-label="CVEs table" variant="compact">
        <Thead>
          <Tr>
            <Th>CVE ID</Th>
            <Th>Title</Th>
            <Th>Discovery</Th>
            <Th>Release</Th>
            <Th>Score</Th>
            <Th>CWE</Th>
            <Th>Products</Th>
          </Tr>
        </Thead>
        <Tbody>
          {advisory?.vulnerabilities.map((vulnerability) => (
            <Tr key={vulnerability.cve}>
              <Td width={10}>
                <NavLink to={`/cves/${vulnerability.cve}`}>
                  {vulnerability.cve}
                </NavLink>
              </Td>
              <Td modifier="breakWord">{vulnerability.title}</Td>
              <Td width={10}>
                {dayjs(vulnerability.discovery_date).format("MMM DD, YYYY")}
              </Td>
              <Td width={10}>
                {dayjs(vulnerability.release_date).format("MMM DD, YYYY")}
              </Td>
              <Td width={10}>
                {vulnerability.scores
                  .flatMap((item) => item.cvss_v3)
                  .map((item, index) => (
                    // <Label key={index} {...baseSeverityList[item.baseSeverity].labelProps}>
                    //   {item.baseScore}
                    // </Label>
                    <Progress
                      key={index}
                      size="sm"
                      max={10}
                      value={item.baseScore}
                      label={`${item.baseScore}/10`}
                      {...baseSeverityList[item.baseSeverity].progressProps}
                    />
                  ))}
              </Td>
              <Td width={10}>
                {vulnerability.cwe ? (
                  <Tooltip content={vulnerability.cwe.name}>
                    <span>{vulnerability.cwe.id}</span>
                  </Tooltip>
                ) : (
                  "N/A"
                )}
              </Td>
              <Td>
                <DescriptionList>
                  {Object.entries(vulnerability.product_status).map(
                    ([key, value]) => (
                      <DescriptionListGroup>
                        <DescriptionListTerm>{key}</DescriptionListTerm>
                        <DescriptionListDescription>
                          <List>
                            {value.map((item) => (
                              <ListItem>{item}</ListItem>
                            ))}
                          </List>
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    )
                  )}
                </DescriptionList>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
};
