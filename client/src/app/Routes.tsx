import React, { Suspense, lazy } from "react";
import { useParams, useRoutes } from "react-router-dom";

import { Bullseye, Spinner } from "@patternfly/react-core";

const Home = lazy(() => import("./pages/home"));
const Advisories = lazy(() => import("./pages/advisories"));
const Advisory = lazy(() => import("./pages/advisory"));
const Cves = lazy(() => import("./pages/cves"));

export enum PathParam {
  ADVISORY_ID = "advisoryId",
  CVE_ID = "cveId",
}

export const AppRoutes = () => {
  const allRoutes = useRoutes([
    { path: "/", element: <Home /> },
    { path: "/advisories", element: <Advisories /> },
    { path: `/advisories/:${PathParam.ADVISORY_ID}`, element: <Advisory /> },
    { path: "/cves", element: <Cves /> },
    // { path: `/cves/:${PathParam.CVE_ID}`, element: <Cves /> },
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
