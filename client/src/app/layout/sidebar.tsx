import React from "react";
import { NavLink, useMatch } from "react-router-dom";

import {
  Nav,
  NavExpandable,
  NavGroup,
  NavItem,
  NavList,
  PageSidebar,
} from "@patternfly/react-core";
import { css } from "@patternfly/react-styles";

import { LayoutTheme } from "./layout-constants";
import { useFetchProjectById } from "@app/queries/projects";

const LINK_CLASS = "pf-v5-c-nav__link";
const ACTIVE_LINK_CLASS = "pf-m-current";

export const SidebarApp: React.FC = () => {
  const routeParams = useMatch("/projects/:projectId/*");

  let projectId = routeParams?.params.projectId;
  let { project } = useFetchProjectById(projectId);

  const renderPageNav = () => {
    return (
      <Nav id="nav-sidebar" aria-label="Nav" theme={LayoutTheme}>
        <NavList>
          <li className="pf-v5-c-nav__item">
            <NavLink
              to="/advisories"
              className={({ isActive }) => {
                return css(LINK_CLASS, isActive ? ACTIVE_LINK_CLASS : "");
              }}
            >
              Advisories
            </NavLink>
          </li>
        </NavList>
      </Nav>
    );
  };

  return <PageSidebar theme={LayoutTheme}>{renderPageNav()}</PageSidebar>;
};
