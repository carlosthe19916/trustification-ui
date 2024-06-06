import React from "react";
import { NavLink } from "react-router-dom";

import { AxiosError } from "axios";
import dayjs from "dayjs";

import { Skeleton } from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";

import { RENDER_DATE_FORMAT } from "@app/Constants";
import { CveIndexed } from "@app/api/models";
import { SimplePagination } from "@app/components/SimplePagination";
import {
  ConditionalTableBody,
  TableHeaderContentWithControls,
  TableRowContentWithControls,
} from "@app/components/TableControls";
import { SeverityRenderer } from "@app/components/csaf/severity-renderer";
import { useLocalTableControls } from "@app/hooks/table-controls";
import { useFetchCveIndexedById } from "@app/queries/cves";

interface RelatedVulnerabilitiesProps {
  vulnerabilities: { cve: string; severity: string }[];
}

export const RelatedVulnerabilities: React.FC<RelatedVulnerabilitiesProps> = ({
  vulnerabilities,
}) => {
  const tableControls = useLocalTableControls({
    tableName: "vulnerability-table",
    persistTo: "sessionStorage",
    idProperty: "cve",
    items: vulnerabilities,
    isLoading: false,
    columnNames: {
      id: "ID",
      description: "Description",
      cvss: "CVSS",
      datePublished: "Date published",
    },
    hasActionsColumn: true,
    isFilterEnabled: true,
    filterCategories: [],
    isSortEnabled: true,
    sortableColumns: [],
    isPaginationEnabled: true,
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
              <Th {...getThProps({ columnKey: "datePublished" })} />
            </TableHeaderContentWithControls>
          </Tr>
        </Thead>
        <ConditionalTableBody
          isLoading={false}
          // isError={!!fetchError}
          isNoData={vulnerabilities.length === 0}
          numRenderedColumns={numRenderedColumns}
        >
          {currentPageItems?.map((item, rowIndex) => {
            return (
              <Tbody key={item.cve} isExpanded={isCellExpanded(item)}>
                <Tr {...getTrProps({ item })}>
                  <TableRowContentWithControls
                    {...tableControls}
                    item={item}
                    rowIndex={rowIndex}
                  >
                    <TdWrapper cveId={item.cve}>
                      {(cve, isFetching, fetchError) => (
                        <>
                          {isFetching ? (
                            <Td width={100} colSpan={4}>
                              <Skeleton />
                            </Td>
                          ) : (
                            <>
                              <Td
                                width={15}
                                {...getTdProps({ columnKey: "id" })}
                              >
                                <NavLink to={`/cves/${item.cve}`}>
                                  {item.cve}
                                </NavLink>
                              </Td>
                              <Td
                                width={50}
                                modifier="truncate"
                                {...getTdProps({ columnKey: "description" })}
                              >
                                {cve?.document.document.descriptions.join(". ")}
                              </Td>
                              <Td
                                width={15}
                                modifier="truncate"
                                {...getTdProps({ columnKey: "cvss" })}
                              >
                                {cve && (
                                  <SeverityRenderer
                                    variant="progress"
                                    score={cve.score}
                                  />
                                )}
                              </Td>
                              <Td
                                width={15}
                                modifier="truncate"
                                {...getTdProps({ columnKey: "datePublished" })}
                              >
                                {dayjs(
                                  cve?.document.document.date_published
                                ).format(RENDER_DATE_FORMAT)}
                              </Td>
                            </>
                          )}
                        </>
                      )}
                    </TdWrapper>
                  </TableRowContentWithControls>
                </Tr>
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

const TdWrapper = ({
  cveId,
  children,
}: {
  cveId: string;
  children: (
    sbom: CveIndexed | undefined,
    isFetching: boolean,
    fetchError: AxiosError
  ) => React.ReactNode;
}) => {
  const { cve, isFetching, fetchError } = useFetchCveIndexedById(cveId);
  return children(cve, isFetching, fetchError);
};
