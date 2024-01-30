import { ToolbarContent } from "@patternfly/react-core";
import {
  ExpandableRowContent,
  IExtraData,
  IRowData,
  Td as PFTd,
  Tr as PFTr,
} from "@patternfly/react-table";
import React from "react";
import { NavLink } from "react-router-dom";

import dayjs from "dayjs";
import {
  ConditionalTableBody,
  FilterType,
  useClientTableBatteries,
} from "@mturley-latest/react-table-batteries";

import { RENDER_DATE_FORMAT } from "@app/Constants";
import { SbomVulnerabilities } from "@app/api/models";
import { SeverityRenderer } from "@app/components/csaf/severity-renderer";

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
  const tableControls = useClientTableBatteries({
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
    filter: {
      isEnabled: true,
      filterCategories: [
        {
          key: "filterText",
          title: "Filter text",
          type: FilterType.search,
          placeholderText: "Search...",
          getItemValue: (item) => `${item.id} ${item.description}`,
        },
      ],
    },
    sort: {
      isEnabled: true,
      sortableColumns: ["id", "affectedDependencies", "published", "updated"],
      getSortValues: (item) => ({
        id: item?.id || "",
        affectedDependencies: Object.keys(item.affected_packages || {}).length,
        published: item ? dayjs(item.published as any).millisecond() : 0,
        updated: item ? dayjs(item.updated as any).millisecond() : 0,
      }),
    },
    pagination: { isEnabled: true },
    expansion: {
      isEnabled: true,
      variant: "compound",
      persistTo: "state",
    },
  });

  const {
    currentPageItems,
    numRenderedColumns,
    components: {
      Table,
      Thead,
      Tr,
      Th,
      Tbody,
      Td,
      Toolbar,
      FilterToolbar,
      PaginationToolbarItem,
      Pagination,
    },
    expansion: { isCellExpanded, setCellExpanded },
  } = tableControls;

  return (
    <>
      <Toolbar>
        <ToolbarContent>
          <FilterToolbar id="vulnerabilities-toolbar" />
          <PaginationToolbarItem>
            <Pagination
              variant="top"
              isCompact
              widgetId="vulnerabilities-pagination-top"
            />
          </PaginationToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <Table
        aria-label="Vulnerabilities table"
        className="vertical-aligned-table"
      >
        <Thead>
          <Tr isHeaderRow>
            <Th columnKey="id" />
            <Th columnKey="description" />
            <Th columnKey="cvss" />
            <Th columnKey="affectedDependencies" />
            <Th columnKey="published" />
            <Th columnKey="updated" />
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
                <Tr item={item} rowIndex={rowIndex}>
                  <Td
                    width={15}
                    columnKey="id"
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
                  <Td width={40} modifier="truncate" columnKey="description">
                    {item.description}
                  </Td>
                  <Td width={15} columnKey="cvss">
                    {item.sources?.mitre?.score && (
                      <SeverityRenderer
                        variant="progress"
                        score={item.sources.mitre.score}
                      />
                    )}
                  </Td>
                  <Td
                    width={10}
                    columnKey="affectedDependencies"
                    compoundExpand={{
                      isExpanded: isCellExpanded(item, "affectedDependencies"),
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
                  <Td width={10} columnKey="published">
                    {dayjs(item.published as any).format(RENDER_DATE_FORMAT)}
                  </Td>
                  <Td width={10} columnKey="updated">
                    {dayjs(item.updated as any).format(RENDER_DATE_FORMAT)}
                  </Td>
                </Tr>
                {isCellExpanded(item) ? (
                  <PFTr isExpanded>
                    <PFTd colSpan={7}>
                      <ExpandableRowContent>
                        {isCellExpanded(item, "id") && <>id</>}
                        {isCellExpanded(item, "affectedDependencies") && (
                          <>packages</>
                        )}
                        all
                      </ExpandableRowContent>
                    </PFTd>
                  </PFTr>
                ) : null}
              </Tbody>
            );
          })}
        </ConditionalTableBody>
      </Table>
      <Pagination
        variant="bottom"
        isCompact
        widgetId="vulnerabilities-pagination-bottom"
      />
    </>
  );
};
