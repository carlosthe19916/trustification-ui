import React, { useMemo } from "react";
import { Link } from "react-router-dom";

import { CodeEditor, Language } from "@patternfly/react-code-editor";
import {
  Breadcrumb,
  BreadcrumbItem,
  PageSection,
} from "@patternfly/react-core";

import DetailsPage from "@patternfly/react-component-groups/dist/dynamic/DetailsPage";
import DownloadIcon from "@patternfly/react-icons/dist/esm/icons/download-icon";

import { PathParam, useRouteParams } from "@app/Routes";
import { useDownloadAdvisory } from "@app/hooks/csaf/download-advisory";
import { useFetchSbomById } from "@app/queries/sboms";

export const SbomDetails: React.FC = () => {
  const sbomId = useRouteParams(PathParam.SBOM_ID);
  const { sbom, isFetching, fetchError } = useFetchSbomById(sbomId);

  const sbomString = useMemo(() => {
    return JSON.stringify(sbom, null, 2);
  }, [sbom]);

  const { downloadSbom } = useDownloadAdvisory();

  return (
    <>
      <PageSection variant="light">
        <DetailsPage
          breadcrumbs={
            <Breadcrumb>
              <BreadcrumbItem key="advisories">
                <Link to="/sboms">SBOMs</Link>
              </BreadcrumbItem>
              <BreadcrumbItem to="#" isActive>
                SBOM details
              </BreadcrumbItem>
            </Breadcrumb>
          }
          pageHeading={{
            title: sbomId ?? "",
            // label: {
            //   children: sbom ? (
            //     <RHSeverityShield
            //       value={sbom.document.aggregate_severity.text}
            //     />
            //   ) : null,
            //   isCompact: true,
            // },
          }}
          actionButtons={[
            {
              children: (
                <>
                  <DownloadIcon /> Download
                </>
              ),
              onClick: () => {
                if (sbomId) {
                  downloadSbom(sbomId);
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
                  {/* <LoadingWrapper
                    isFetching={isFetching}
                    fetchError={fetchError}
                  >
                    {sbom && <Overview advisory={sbom} />}
                  </LoadingWrapper> */}
                </div>
              ),
            },
            {
              eventKey: "info",
              title: "Info",
              children: (
                <div className="pf-v5-u-m-md">
                  {/* <LoadingWrapper
                    isFetching={isFetching}
                    fetchError={fetchError}
                  >
                    <NotesMarkdown notes={sbom?.document.notes || []} />
                  </LoadingWrapper> */}
                </div>
              ),
            },
            {
              eventKey: "packages",
              title: "Packages",
              children: (
                <div className="pf-v5-u-m-md">
                  {/* <LoadingWrapper
                    isFetching={isFetching}
                    fetchError={fetchError}
                  >
                    <Vulnerabilities
                      isFetching={isFetching}
                      fetchError={fetchError}
                      vulnerabilities={sbom?.vulnerabilities || []}
                    />
                  </LoadingWrapper> */}
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
                    code={sbomString}
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
