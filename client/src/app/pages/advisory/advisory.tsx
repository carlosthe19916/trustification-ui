import React from "react";
import { Link, useParams } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  PageSection,
  Text,
  TextContent,
} from "@patternfly/react-core";
import DownloadIcon from "@patternfly/react-icons/dist/esm/icons/download-icon";
import spacing from "@patternfly/react-styles/css/utilities/Spacing/spacing";
import DetailsPage from "@patternfly/react-component-groups/dist/dynamic/DetailsPage";

import ReactMarkdown from "react-markdown";
import { markdownPFComponents } from "@app/components/markdownPFComponents";

import { PathParam, useRouteParams } from "@app/Routes";
import { useFetchAdvisoryById } from "@app/queries/advisories";
import { Overview } from "./overview";
import { RHSeverityShield } from "@app/components/csaf/rh-severity";

export const Advisory: React.FC = () => {
  const advisoryId = useRouteParams(PathParam.ADVISORY_ID);
  const { advisory } = useFetchAdvisoryById(advisoryId);

  return (
    <>
      <PageSection variant="light">
        <DetailsPage
          breadcrumbs={
            <Breadcrumb>
              <BreadcrumbItem key="advisories">
                <Link to="/advisories">Advisories</Link>
              </BreadcrumbItem>
              <BreadcrumbItem to="#" isActive>
                Advisory details
              </BreadcrumbItem>
            </Breadcrumb>
          }
          pageHeading={{
            title: advisoryId ?? "",
            label: {
              children: advisory ? (
                <RHSeverityShield
                  value={advisory.document.aggregate_severity.text}
                />
              ) : null,
              isCompact: true,
            },
          }}
          actionButtons={[
            {
              children: (
                <>
                  <DownloadIcon /> Download
                </>
              ),
              onClick: () => console.log("Primary action clicked"),
              variant: "secondary",
            },
          ]}
          tabs={[
            {
              eventKey: "overview",
              title: "Overview",
              children: (
                <div className="pf-v5-u-m-md">
                  {advisory && <Overview advisory={advisory} />}
                </div>
              ),
            },
            {
              eventKey: "notes",
              title: "Notes",
              children: (
                <div className="pf-v5-u-m-md">
                  {advisory?.document.notes.map((e) => (
                    <TextContent className={spacing.mbMd}>
                      <Text component="h1">
                        {e.title} ({e.category.replace("_", " ")})
                      </Text>
                      <ReactMarkdown components={markdownPFComponents}>
                        {e.text}
                      </ReactMarkdown>
                    </TextContent>
                  ))}
                </div>
              ),
            },
            {
              eventKey: "vulnerabilities",
              title: "Vulnerabilities",
              children: <div className="pf-v5-u-m-md">Other content</div>,
            },
            {
              eventKey: "source",
              title: "Source",
              children: <div className="pf-v5-u-m-md">Other content</div>,
            },
          ]}
        />
      </PageSection>
    </>
  );
};
