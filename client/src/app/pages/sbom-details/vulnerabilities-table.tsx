import React from "react";
import { NavLink } from "react-router-dom";

import dayjs from "dayjs";
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
  IExtraData,
  IRowData,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";

import { RENDER_DATE_FORMAT } from "@app/Constants";
import { SbomVulnerabilities } from "@app/api/models";
import { FilterToolbar, FilterType } from "@app/components/FilterToolbar";
import { SimplePagination } from "@app/components/SimplePagination";
import {
  ConditionalTableBody,
  TableHeaderContentWithControls,
  TableRowContentWithControls,
} from "@app/components/TableControls";
import { SeverityRenderer } from "@app/components/csaf/severity-renderer";
import { useLocalTableControls } from "@app/hooks/table-controls";
import { useFetchAdvisoryByCveId } from "@app/queries/advisories";

interface VulnerabilitiresTableProps {
  isFetching: boolean;
  fetchError: Error;
  sbomVulnerabilitires?: SbomVulnerabilities;
}

export const VulnerabilitiresTable: React.FC<VulnerabilitiresTableProps> = ({
  isFetching,
  fetchError,
  sbomVulnerabilitires,
}) => {
  const tableControls = useLocalTableControls({
    tableName: "vulnerability-table",
    persistTo: "sessionStorage",
    idProperty: "id",
    items: sbomVulnerabilitires?.details || [],
    isLoading: isFetching,
    columnNames: {
      id: "ID",
      description: "Description",
      cvss: "CVSS",
      affectedDependencies: "Affected dependencies",
      published: "Published",
      updated: "Updated",
    },
    hasActionsColumn: true,
    isFilterEnabled: true,
    filterCategories: [
      {
        categoryKey: "filterText",
        title: "Filter text",
        type: FilterType.search,
        placeholderText: "Search...",
        getItemValue: (item) => `${item.id} ${item.description}`,
      },
    ],
    isSortEnabled: true,
    sortableColumns: ["id", "affectedDependencies", "published", "updated"],
    getSortValues: (item) => ({
      id: item?.id || "",
      affectedDependencies: Object.keys(item.affected_packages || {}).length,
      published: item ? dayjs(item.published as any).millisecond() : 0,
      updated: item ? dayjs(item.updated as any).millisecond() : 0,
    }),
    isPaginationEnabled: true,
    isExpansionEnabled: true,
    expandableVariant: "compound",
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
    expansionDerivedState: { isCellExpanded, setCellExpanded },
  } = tableControls;

  return (
    <>
      <Toolbar {...toolbarProps}>
        <ToolbarContent>
          <FilterToolbar showFiltersSideBySide {...filterToolbarProps} />
          <ToolbarItem {...paginationToolbarItemProps}>
            <SimplePagination
              idPrefix="vulnerability-table"
              isTop
              paginationProps={paginationProps}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <Table
        {...tableProps}
        aria-label="Vulnerability table"
        className="vertical-aligned-table"
      >
        <Thead>
          <Tr>
            <TableHeaderContentWithControls {...tableControls}>
              <Th {...getThProps({ columnKey: "id" })} />
              <Th {...getThProps({ columnKey: "description" })} />
              <Th {...getThProps({ columnKey: "cvss" })} />
              <Th {...getThProps({ columnKey: "affectedDependencies" })} />
              <Th {...getThProps({ columnKey: "published" })} />
              <Th {...getThProps({ columnKey: "updated" })} />
            </TableHeaderContentWithControls>
          </Tr>
        </Thead>
        <ConditionalTableBody
          isLoading={isFetching}
          isError={!!fetchError}
          isNoData={sbomVulnerabilitires?.details.length === 0}
          numRenderedColumns={numRenderedColumns}
        >
          {currentPageItems?.map((item, rowIndex) => {
            return (
              <Tbody key={item.id} isExpanded={isCellExpanded(item)}>
                <Tr {...getTrProps({ item })}>
                  <TableRowContentWithControls
                    {...tableControls}
                    item={item}
                    rowIndex={rowIndex}
                  >
                    <Td
                      width={15}
                      {...getTdProps({ columnKey: "id" })}
                      compoundExpand={{
                        isExpanded: isCellExpanded(item, "id"),
                        onToggle: (
                          event: React.MouseEvent,
                          rowIndex: number,
                          colIndex: number,
                          isOpen: boolean,
                          rowData: IRowData,
                          extraData: IExtraData
                        ) => {
                          setCellExpanded({
                            item,
                            isExpanding: !isOpen,
                            columnKey: "id",
                          });
                        },
                      }}
                    >
                      <NavLink to={`/cves/${item.id}`}>{item.id}</NavLink>
                    </Td>
                    <Td
                      width={40}
                      modifier="truncate"
                      {...getTdProps({ columnKey: "description" })}
                    >
                      {item.description}
                    </Td>
                    <Td width={15} {...getTdProps({ columnKey: "cvss" })}>
                      {item.sources?.mitre?.score && (
                        <SeverityRenderer
                          variant="progress"
                          score={item.sources.mitre.score}
                        />
                      )}
                    </Td>
                    <Td
                      width={10}
                      {...getTdProps({ columnKey: "affectedDependencies" })}
                      compoundExpand={{
                        isExpanded: isCellExpanded(
                          item,
                          "affectedDependencies"
                        ),
                        onToggle: (
                          event: React.MouseEvent,
                          rowIndex: number,
                          colIndex: number,
                          isOpen: boolean,
                          rowData: IRowData,
                          extraData: IExtraData
                        ) => {
                          setCellExpanded({
                            item,
                            isExpanding: !isOpen,
                            columnKey: "affectedDependencies",
                          });
                        },
                      }}
                    >
                      {Object.keys(item.affected_packages || {}).length}
                    </Td>
                    <Td width={10} {...getTdProps({ columnKey: "published" })}>
                      {dayjs(item.published as any).format(RENDER_DATE_FORMAT)}
                    </Td>
                    <Td width={10} {...getTdProps({ columnKey: "updated" })}>
                      {dayjs(item.updated as any).format(RENDER_DATE_FORMAT)}
                    </Td>
                  </TableRowContentWithControls>
                </Tr>
                {isCellExpanded(item) ? (
                  <Tr isExpanded>
                    <Td colSpan={7}>
                      <ExpandableRowContent>
                        {isCellExpanded(item, "id") && (
                          <CVEDetails
                            id={item.id}
                            description={item.description}
                          />
                        )}
                        {isCellExpanded(item, "affectedDependencies") && (
                          <AffectedDependenciesTable
                            data={Array.from(
                              Object.keys(item.affected_packages || {})
                            )}
                          />
                        )}
                      </ExpandableRowContent>
                    </Td>
                  </Tr>
                ) : null}
              </Tbody>
            );
          })}
        </ConditionalTableBody>
      </Table>
      <SimplePagination
        idPrefix="vulnerability-table"
        isTop={false}
        isCompact
        paginationProps={paginationProps}
      />
    </>
  );
};

const AffectedDependenciesTable = ({ data }: { data: string[] }) => {
  const pageItems = React.useMemo(() => {
    return data.map((e) => {
      let packageUrl;
      try {
        packageUrl = PackageURL.fromString(e);
      } catch (e) {
        console.log(e);
      }
      return {
        purl: e,
        package: packageUrl,
      };
    });
  }, [data]);

  const tableControls = useLocalTableControls({
    tableName: "affected-dependencies-table",
    variant: "compact",
    persistTo: "state",
    idProperty: "purl",
    items: pageItems || [],
    isLoading: false,
    columnNames: {
      type: "Type",
      namespace: "Namespace",
      name: "Name",
      version: "Version",
      path: "Path",
      qualifiers: "Qualifiers",
    },
    isFilterEnabled: true,
    filterCategories: [],
    isSortEnabled: true,
    sortableColumns: [],
  });

  const {
    currentPageItems,
    numRenderedColumns,
    propHelpers: { getThProps, getTrProps, getTdProps },
    expansionDerivedState: { isCellExpanded },
  } = tableControls;

  return (
    <>
      <Table aria-label="Packages details table">
        <Thead>
          <Tr>
            <TableHeaderContentWithControls {...tableControls}>
              <Th {...getThProps({ columnKey: "type" })} />
              <Th {...getThProps({ columnKey: "namespace" })} />
              <Th {...getThProps({ columnKey: "name" })} />
              <Th {...getThProps({ columnKey: "version" })} />
              <Th {...getThProps({ columnKey: "path" })} />
              <Th {...getThProps({ columnKey: "qualifiers" })} />
            </TableHeaderContentWithControls>
          </Tr>
        </Thead>
        <ConditionalTableBody
          isNoData={pageItems.length === 0}
          numRenderedColumns={numRenderedColumns}
        >
          {currentPageItems?.map((item, rowIndex) => {
            return (
              <Tbody key={item.purl}>
                <Tr {...getTrProps({ item })}>
                  <TableRowContentWithControls
                    {...tableControls}
                    item={item}
                    rowIndex={rowIndex}
                  >
                    <Td width={15} {...getTdProps({ columnKey: "type" })}>
                      {item.package?.type}
                    </Td>
                    <Td
                      width={15}
                      modifier="truncate"
                      {...getTdProps({ columnKey: "namespace" })}
                    >
                      {item.package?.namespace}
                    </Td>
                    <Td width={15} {...getTdProps({ columnKey: "name" })}>
                      <NavLink
                        to={`/packages/${encodeURIComponent(item.purl)}`}
                      >
                        {item.package?.name}
                      </NavLink>
                    </Td>
                    <Td width={15} {...getTdProps({ columnKey: "version" })}>
                      {item.package?.version}
                    </Td>
                    <Td
                      width={10}
                      modifier="truncate"
                      {...getTdProps({ columnKey: "path" })}
                    >
                      {item.package?.subpath}
                    </Td>
                    <Td width={30} {...getTdProps({ columnKey: "qualifiers" })}>
                      {Object.entries(item.package?.qualifiers || {}).map(
                        ([k, v], index) => (
                          <Label key={index} isCompact>{`${k}=${v}`}</Label>
                        )
                      )}
                    </Td>
                  </TableRowContentWithControls>
                </Tr>
              </Tbody>
            );
          })}
        </ConditionalTableBody>
      </Table>
    </>
  );
};

const CVEDetails = ({
  id,
  description,
}: {
  id: string;
  description: string;
}) => {
  const { advisories } = useFetchAdvisoryByCveId(id);

  return (
    <DescriptionList isCompact>
      <DescriptionListGroup>
        <DescriptionListTerm>Description</DescriptionListTerm>
        <DescriptionListDescription>{description}</DescriptionListDescription>
      </DescriptionListGroup>
      {advisories && (
        <DescriptionListGroup>
          <DescriptionListTerm>Relevant advisories</DescriptionListTerm>
          <DescriptionListDescription>
            <List>
              {advisories.map((e, index) => (
                <ListItem key={index}>
                  <NavLink to={`/advisories/${e.id}`}>{e.id}</NavLink>
                </ListItem>
              ))}
            </List>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
    </DescriptionList>
  );
};
