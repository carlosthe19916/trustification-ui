import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  Bullseye,
  PageSection,
  Spinner,
  Text,
  TextContent,
} from "@patternfly/react-core";
import { CodeEditor, Language } from "@patternfly/react-code-editor";
import ErrorState from "@patternfly/react-component-groups/dist/dynamic/ErrorState";

import DownloadIcon from "@patternfly/react-icons/dist/esm/icons/download-icon";
import spacing from "@patternfly/react-styles/css/utilities/Spacing/spacing";
import DetailsPage from "@patternfly/react-component-groups/dist/dynamic/DetailsPage";

import ReactMarkdown from "react-markdown";
import { markdownPFComponents } from "@app/components/markdownPFComponents";

import { PathParam, useRouteParams } from "@app/Routes";
import { useFetchAdvisoryById } from "@app/queries/advisories";
import { Overview } from "./overview";
import { RHSeverityShield } from "@app/components/csaf/rh-severity";
import { Vulnerabilities } from "./vulnerabilities";
import { NotesMarkdown } from "@app/components/csaf/notes-markdown";
import { useDownloadAdvisory } from "@app/hooks/csaf/download-advisory";

export const LoadingWrapper = (props: {
  isFetching: boolean;
  fetchError?: Error;
  children: React.ReactNode;
}) => {
  if (props.isFetching) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  } else if (props.fetchError) {
    return <ErrorState errorTitle="Error" />;
  } else {
    return props.children;
  }
};

export const Advisory: React.FC = () => {
  const advisoryId = useRouteParams(PathParam.ADVISORY_ID);
  const { advisory, isFetching, fetchError } = useFetchAdvisoryById(advisoryId);

  const advisoryString = useMemo(() => {
    return JSON.stringify(advisory, null, 2);
  }, [advisory]);

  const downloadAdvisory = useDownloadAdvisory();

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
              onClick: () => {
                if (advisoryId) {
                  downloadAdvisory(advisoryId);
                }
              },
              variant: "secondary",
            },
          ]}
          tabs={[
            {
              eventKey: "overview",
              title: "Overview",
              children: (
                <div className="pf-v5-u-m-md">
                  <LoadingWrapper
                    isFetching={isFetching}
                    fetchError={fetchError}
                  >
                    {advisory && <Overview advisory={advisory} />}
                  </LoadingWrapper>
                </div>
              ),
            },
            {
              eventKey: "notes",
              title: "Notes",
              children: (
                <div className="pf-v5-u-m-md">
                  <LoadingWrapper
                    isFetching={isFetching}
                    fetchError={fetchError}
                  >
                    <NotesMarkdown notes={advisory?.document.notes || []} />
                  </LoadingWrapper>
                </div>
              ),
            },
            {
              eventKey: "vulnerabilities",
              title: "Vulnerabilities",
              children: (
                <div className="pf-v5-u-m-md">
                  <LoadingWrapper
                    isFetching={isFetching}
                    fetchError={fetchError}
                  >
                    <Vulnerabilities
                      isFetching={isFetching}
                      fetchError={fetchError}
                      vulnerabilities={advisory?.vulnerabilities || []}
                    />
                  </LoadingWrapper>
                </div>
              ),
            },
            {
              eventKey: "source",
              title: "Source",
              children: (
                <div className="pf-v5-u-m-md">
                  <CodeEditor
                    isDarkTheme
                    isLineNumbersVisible
                    isReadOnly
                    isMinimapVisible
                    // isLanguageLabelVisible
                    code={advisoryString}
                    language={Language.json}
                    height="685px"
                  />
                </div>
              ),
            },
          ]}
        />
      </PageSection>
    </>
  );
};
