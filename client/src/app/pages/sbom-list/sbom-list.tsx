import React from "react";

import {
  PageSection,
  PageSectionVariants,
  Text,
  TextContent,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";

import { FilterToolbar } from "@app/components/FilterToolbar";
import { SimplePagination } from "@app/components/SimplePagination";

import { useSbomList } from "./useSbomList";

export const SbomList: React.FC = () => {
  const {
    components: { table },
    tableControls: {
      propHelpers: {
        toolbarProps,
        filterToolbarProps,
        paginationToolbarItemProps,
        paginationProps,
      },
    },
  } = useSbomList();

  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <TextContent>
          <Text component="h1">SBOMs</Text>
          {/* <Text component="p">Search for SBOMs</Text> */}
        </TextContent>
      </PageSection>
      <PageSection>
        <div
          style={{
            backgroundColor: "var(--pf-v5-global--BackgroundColor--100)",
          }}
        >
          <Toolbar {...toolbarProps}>
            <ToolbarContent>
              <FilterToolbar showFiltersSideBySide {...filterToolbarProps} />
              <ToolbarItem {...paginationToolbarItemProps}>
                <SimplePagination
                  idPrefix="sbom-table"
                  isTop
                  paginationProps={paginationProps}
                />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
          {table}
          <SimplePagination
            idPrefix="sbom-table"
            isTop
            isCompact
            paginationProps={paginationProps}
          />
        </div>
      </PageSection>
    </>
  );
};
