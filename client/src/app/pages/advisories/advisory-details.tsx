import React from "react";

import { BaseSeverity } from "@app/api/models";
import { useFetchAdvisoryById } from "@app/queries/advisories";
import {
  Bullseye,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  LabelProps,
  List,
  ListItem,
  Spinner,
  Tooltip,
  TreeView,
} from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import dayjs from "dayjs";

type BaseSeverityListType = {
  [key in BaseSeverity]: {
    labelProps: LabelProps;
  };
};
const baseSeverityList: BaseSeverityListType = {
  NONE: {
    labelProps: { color: "grey" },
  },
  LOW: {
    labelProps: { color: "orange" },
  },
  MEDIUM: {
    labelProps: { color: "orange" },
  },
  HIGH: {
    labelProps: { color: "red" },
  },
  CRITICAL: {
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
              <Td width={10}>{vulnerability.cve}</Td>
              <Td modifier="breakWord">{vulnerability.title}</Td>
              <Td width={10}>
                {dayjs(vulnerability.discovery_date).format("MMM DD, YYYY")}
              </Td>
              <Td width={10}>
                {dayjs(vulnerability.release_date).format("MMM DD, YYYY")}
              </Td>
              <Td>
                {vulnerability.scores
                  .flatMap((item) => item.cvss_v3)
                  .map((item) => (
                    <Label {...baseSeverityList[item.baseSeverity].labelProps}>
                      {item.baseScore}
                    </Label>
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
