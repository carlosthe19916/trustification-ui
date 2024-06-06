import React from "react";
import { NavLink } from "react-router-dom";

import { PackageURL } from "packageurl-js";

import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  List,
  ListItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";
import {
  ExpandableRowContent,
  Td as PFTd,
  Tr as PFTr,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";

import { Sbom, SbomCycloneDx, SbomSPDX, SbomType } from "@app/api/models";
import { FilterToolbar, FilterType } from "@app/components/FilterToolbar";
import { SimplePagination } from "@app/components/SimplePagination";
import {
  ConditionalTableBody,
  TableHeaderContentWithControls,
} from "@app/components/TableControls";
import { useLocalTableControls } from "@app/hooks/table-controls";

interface PackagesProps {
  data: Sbom;
}

export const Packages: React.FC<PackagesProps> = ({ data }) => {
  switch (data.type) {
    case SbomType.SPDX:
      return <SpxdPackages sbom={data.sbom} />;
    case SbomType.CycloneDx:
      return <CycloneDxPackages sbom={data.sbom} />;
    default:
      return <>Not supported SBOM format</>;
  }
};

interface SpxdPackagesProps {
  sbom: SbomSPDX;
}

export const SpxdPackages: React.FC<SpxdPackagesProps> = ({ sbom }) => {
  const pageItems = React.useMemo(() => {
    return sbom.packages.map((e) => {
      let packageUrl;
      try {
        packageUrl = PackageURL.fromString(
          (e.externalRefs || [])[0].referenceLocator
        );
      } catch (e) {
        console.log(e);
      }
      return {
        ...e,
        id: `${e.name}_${e.versionInfo}`,
        package: packageUrl,
      };
    });
  }, [sbom]);

  const tableControls = useLocalTableControls({
    tableName: "package-table",
    idProperty: "id",
    items: pageItems || [],
    isLoading: false,
    columnNames: {
      name: "Name",
      version: "Version",
      qualifiers: "Qualifiers",
    },
    isFilterEnabled: true,
    filterCategories: [
      {
        categoryKey: "cve",
        title: "ID",
        type: FilterType.search,
        placeholderText: "Search...",
        getItemValue: (item) =>
          item.package
            ? `${item.package.name} ${item.package.namespace}`
            : item.name,
      },
    ],
    isSortEnabled: true,
    sortableColumns: [],
    isExpansionEnabled: true,
    expandableVariant: "single",
  });

  const {
    currentPageItems,
    numRenderedColumns,
    propHelpers: {
      toolbarProps,
      filterToolbarProps,
      paginationToolbarItemProps,
      paginationProps,
      tableProps,
      getThProps,
      getTrProps,
      getTdProps,
    },
    expansionDerivedState: { isCellExpanded },
  } = tableControls;

  return (
    <>
      <Toolbar {...toolbarProps}>
        <ToolbarContent>
          <FilterToolbar showFiltersSideBySide {...filterToolbarProps} />
          <ToolbarItem {...paginationToolbarItemProps}>
            <SimplePagination
              idPrefix="package-table"
              isTop
              paginationProps={paginationProps}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <Table
        {...tableProps}
        aria-label="Package table"
        className="vertical-aligned-table"
      >
        <Thead>
          <Tr>
            <TableHeaderContentWithControls {...tableControls}>
              <Th {...getThProps({ columnKey: "name" })} />
              <Th {...getThProps({ columnKey: "version" })} />
              <Th {...getThProps({ columnKey: "qualifiers" })} />
            </TableHeaderContentWithControls>
          </Tr>
        </Thead>
        <ConditionalTableBody
          isNoData={pageItems?.length === 0}
          numRenderedColumns={numRenderedColumns}
        >
          {currentPageItems?.map((item, rowIndex) => {
            const packageUrl = item.externalRefs
              ?.filter((e) => e.referenceLocator)
              .map((e) => {
                let packageUrl;
                try {
                  packageUrl = PackageURL.fromString(e.referenceLocator);
                } catch (e) {
                  console.log(e);
                }
                return packageUrl;
              })
              .find((e) => e);

            return (
              <Tbody key={item.id}>
                <Tr {...getTrProps({ item })}>
                  <Td
                    width={50}
                    modifier="truncate"
                    {...getTdProps({ columnKey: "name" })}
                  >
                    {item.package ? (
                      <>
                        {`${item.package.name}/${item.package.namespace}`}{" "}
                        <Label color="blue">{item.package.type}</Label>
                      </>
                    ) : (
                      item.name
                    )}
                  </Td>
                  <Td
                    width={20}
                    modifier="truncate"
                    {...getTdProps({ columnKey: "version" })}
                  >
                    {item.versionInfo}
                  </Td>
                  <Td width={30} {...getTdProps({ columnKey: "qualifiers" })}>
                    {item.package &&
                      Object.entries(item.package?.qualifiers || {}).map(
                        ([k, v], index) => (
                          <Label key={index} isCompact>{`${k}=${v}`}</Label>
                        )
                      )}
                  </Td>
                </Tr>
                {isCellExpanded(item) ? (
                  <Tr isExpanded>
                    <Td colSpan={7}>
                      <div className="pf-v5-u-m-md">
                        <ExpandableRowContent>
                          <DescriptionList isCompact isAutoFit>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                Packages
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                <List>
                                  {item.externalRefs
                                    ?.map((e) => e.referenceLocator)
                                    .map((e, index) => (
                                      <ListItem key={index}>
                                        <NavLink
                                          to={`/packages/${encodeURIComponent(e)}`}
                                        >
                                          {e}
                                        </NavLink>
                                      </ListItem>
                                    ))}
                                </List>
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                Qualifiers
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                {packageUrl &&
                                  Object.entries(
                                    packageUrl?.qualifiers || {}
                                  ).map(([k, v], index) => (
                                    <Label
                                      key={index}
                                      isCompact
                                    >{`${k}=${v}`}</Label>
                                  ))}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                Versions
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                {packageUrl && packageUrl.version}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                          </DescriptionList>
                        </ExpandableRowContent>
                      </div>
                    </Td>
                  </Tr>
                ) : null}
              </Tbody>
            );
          })}
        </ConditionalTableBody>
      </Table>
      <SimplePagination
        idPrefix="package-table"
        isTop={false}
        isCompact
        paginationProps={paginationProps}
      />
    </>
  );
};

interface CycloneDxPackagesProps {
  sbom: SbomCycloneDx;
}

export const CycloneDxPackages: React.FC<CycloneDxPackagesProps> = ({
  sbom,
}) => {
  const pageItems = React.useMemo(() => {
    return sbom.components.map((e) => {
      let packageUrl;
      try {
        if (e.purl) {
          packageUrl = PackageURL.fromString(e.purl);
        }
      } catch (e) {
        console.log(e);
      }
      return {
        ...e,
        package: packageUrl,
      };
    });
  }, [sbom]);

  const tableControls = useLocalTableControls({
    tableName: "package-table",
    persistTo: "state",
    idProperty: "purl",
    items: pageItems || [],
    isLoading: false,
    columnNames: {
      name: "Name",
      version: "Version",
      qualifiers: "Qualifiers",
    },
    isFilterEnabled: true,
    filterCategories: [
      {
        categoryKey: "cve",
        title: "ID",
        type: FilterType.search,
        placeholderText: "Search...",
        getItemValue: (item) =>
          item.package
            ? `${item.package.name} ${item.package.namespace}`
            : item.name,
      },
    ],
    isSortEnabled: true,
    sortableColumns: [],
    isExpansionEnabled: true,
    expandableVariant: "single",
  });

  const {
    currentPageItems,
    numRenderedColumns,
    propHelpers: {
      toolbarProps,
      filterToolbarProps,
      paginationToolbarItemProps,
      paginationProps,
      tableProps,
      getThProps,
      getTrProps,
      getTdProps,
    },
    expansionDerivedState: { isCellExpanded },
  } = tableControls;

  return (
    <>
      <Toolbar {...toolbarProps}>
        <ToolbarContent>
          <FilterToolbar showFiltersSideBySide {...filterToolbarProps} />
          <ToolbarItem {...paginationToolbarItemProps}>
            <SimplePagination
              idPrefix="package-table"
              isTop
              paginationProps={paginationProps}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <Table
        {...tableProps}
        aria-label="Package table"
        className="vertical-aligned-table"
      >
        <Thead>
          <Tr>
            <TableHeaderContentWithControls {...tableControls}>
              <Th {...getThProps({ columnKey: "name" })} />
              <Th {...getThProps({ columnKey: "version" })} />
              <Th {...getThProps({ columnKey: "qualifiers" })} />
            </TableHeaderContentWithControls>
          </Tr>
        </Thead>
        <ConditionalTableBody
          isNoData={pageItems?.length === 0}
          numRenderedColumns={numRenderedColumns}
        >
          {currentPageItems?.map((item, rowIndex) => {
            return (
              <Tbody key={item.purl}>
                <Tr {...getTrProps({ item })}>
                  <Td
                    width={50}
                    modifier="truncate"
                    {...getTdProps({ columnKey: "name" })}
                  >
                    {item.package ? (
                      <>
                        {`${item.package.name}/${item.package.namespace}`}{" "}
                        <Label color="blue">{item.package.type}</Label>
                      </>
                    ) : (
                      item.name
                    )}
                  </Td>
                  <Td
                    width={20}
                    modifier="truncate"
                    {...getTdProps({ columnKey: "version" })}
                  >
                    {item.version}
                  </Td>
                  <Td width={30} {...getTdProps({ columnKey: "qualifiers" })}>
                    {item.package &&
                      Object.entries(item.package?.qualifiers || {}).map(
                        ([k, v], index) => (
                          <Label key={index} isCompact>{`${k}=${v}`}</Label>
                        )
                      )}
                  </Td>
                </Tr>
                {isCellExpanded(item) ? (
                  <PFTr isExpanded>
                    <PFTd colSpan={7}>
                      <div className="pf-v5-u-m-md">
                        <ExpandableRowContent>
                          <DescriptionList isCompact isAutoFit>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                Licenses
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                <List>
                                  {item.licenses
                                    ?.map((e) => e.license.id)
                                    .map((e, index) => (
                                      <ListItem key={index}>{e}</ListItem>
                                    ))}
                                </List>
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                          </DescriptionList>
                        </ExpandableRowContent>
                      </div>
                    </PFTd>
                  </PFTr>
                ) : null}
              </Tbody>
            );
          })}
        </ConditionalTableBody>
      </Table>
      <SimplePagination
        idPrefix="package-table"
        isTop={false}
        isCompact
        paginationProps={paginationProps}
      />
    </>
  );
};
