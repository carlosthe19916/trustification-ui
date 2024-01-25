import React, { Suspense, lazy } from "react";
import { useRoutes } from "react-router-dom";

import { Bullseye, Spinner } from "@patternfly/react-core";

const Home = lazy(() => import("./pages/home"));
const Advisories = lazy(() => import("./pages/advisories"));

export const ViewRepositoryRouteParam = "repositoryId";
export const ViewPackageRouteParam = "packageId";

export const AppRoutes = () => {
  const allRoutes = useRoutes([
    { path: "/", element: <Home /> },
    { path: "/advisories", element: <Advisories /> },    
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
