import React, { Suspense, lazy } from "react";
import { useParams, useRoutes } from "react-router-dom";

import { Bullseye, Spinner } from "@patternfly/react-core";

const Home = lazy(() => import("./pages/home"));
const AdvisoryList = lazy(() => import("./pages/advisory-list"));
const AdvisoryDetails = lazy(() => import("./pages/advisory-details"));
const CveList = lazy(() => import("./pages/cve-list"));
const SbomList = lazy(() => import("./pages/sbom-list"));
const PackageList = lazy(() => import("./pages/package-list"));

export enum PathParam {
  ADVISORY_ID = "advisoryId",
  CVE_ID = "cveId",
  SBOM_ID = "sbomId",
  PACKAGE_ID = "packageId",
}

export const AppRoutes = () => {
  const allRoutes = useRoutes([
    { path: "/", element: <Home /> },
    { path: "/advisories", element: <AdvisoryList /> },
    { path: `/advisories/:${PathParam.ADVISORY_ID}`, element: <AdvisoryDetails /> },
    { path: "/cves", element: <CveList /> },
    // { path: `/cves/:${PathParam.CVE_ID}`, element: <Cves /> },
    { path: "/sboms", element: <SbomList /> },
    // { path: `/sboms/:${PathParam.SBOM_ID}`, element: <Cves /> },
    { path: "/packages", element: <PackageList /> },
    // { path: `/packages/:${PathParam.PACKAGE_ID}`, element: <Cves /> },

    // { path: "*", element: <Navigate to="/organizations" /> },
  ]);

  return (
    <Suspense
      fallback={
        <Bullseye>
          <Spinner />
        </Bullseye>
      }
    >
      {allRoutes}
    </Suspense>
  );
};

export const useRouteParams = (pathParam: PathParam) => {
  let params = useParams();
  return params[pathParam];
};
