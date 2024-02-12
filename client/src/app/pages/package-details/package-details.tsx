import React, { useMemo } from "react";
import { Link } from "react-router-dom";

import { CodeEditor, Language } from "@patternfly/react-code-editor";
import {
  Breadcrumb,
  BreadcrumbItem,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  PageSection,
  Stack,
  StackItem,
  Text,
  TextContent,
} from "@patternfly/react-core";

import DetailsPage from "@patternfly/react-component-groups/dist/dynamic/DetailsPage";
import DownloadIcon from "@patternfly/react-icons/dist/esm/icons/download-icon";

import dayjs from "dayjs";

import { RENDER_DATE_FORMAT } from "@app/Constants";
import { PathParam, useRouteParams } from "@app/Routes";
import { SbomType } from "@app/api/models";
import { LoadingWrapper } from "@app/components/LoadingWrapper";
import { useDownload } from "@app/hooks/csaf/download-advisory";
import {
  useFetchSbomById,
  useFetchSbomIndexedById,
  useFetchSbomVulnerabilitiesById,
} from "@app/queries/sboms";
import { useFetchPackageById } from "@app/queries/packages";
import { PackageURL } from "packageurl-js";

export const PackageDetails: React.FC = () => {
  const packageId = useRouteParams(PathParam.PACKAGE_ID);

  const {
    pkg,
    isFetching: isFetchingSbom,
    fetchError: fetchErrorSbom,
  } = useFetchPackageById(packageId);

  // const {
  //   vulnerabilities: sbomVulnerabilities,
  //   isFetching: isFetchingSbomVulnerabilities,
  //   fetchError: fetchErrorSbomVulnerabilities,
  // } = useFetchSbomVulnerabilitiesById(packageId);

  const pkgUrl = useMemo(() => {
    if (pkg) {
      try {
        return PackageURL.fromString(pkg.purl);
      } catch (e) {}
    }
  }, [pkg]);

  let pkgName;
  if (pkgUrl) {
    pkgName =
      pkgUrl.type === "maven"
        ? `${pkgUrl.namespace}:${pkgUrl.name}`
        : `${pkgUrl.namespace}/${pkgUrl.name}`;
  }

  return (
    <>
      <PageSection variant="light">
        <DetailsPage
          breadcrumbs={
            <Breadcrumb>
              <BreadcrumbItem key="packages">
                <Link to="/packages">Packages</Link>
              </BreadcrumbItem>
              <BreadcrumbItem to="#" isActive>
                Package details
              </BreadcrumbItem>
            </Breadcrumb>
          }
          pageHeading={{
            title: pkgName ?? packageId ?? "",
            iconAfterTitle: (
              <TextContent>
                <Text component="pre">{`version: ${pkgUrl?.version}`}</Text>
              </TextContent>
            ),
            label: {
              children: pkgUrl ? `type=${pkgUrl.type}` : "",
              isCompact: true,
            },
          }}
          actionButtons={[]}
          tabs={[
            {
              eventKey: "vulnerabilities",
              title: "Vulnerabilities",
              children: <div className="pf-v5-u-m-md"></div>,
            },
            {
              eventKey: "products-using-package",
              title: "Products using package",
              children: <div className="pf-v5-u-m-md"></div>,
            },
          ]}
        />
      </PageSection>
    </>
  );
};
