import React from "react";
import { NavLink } from "react-router-dom";

import dayjs from "dayjs";

import { Button } from "@patternfly/react-core";
import DownloadIcon from "@patternfly/react-icons/dist/esm/icons/download-icon";
import {
  ExpandableRowContent,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";

import {
  FILTER_DATE_FORMAT,
  TablePersistenceKeyPrefixes,
} from "@app/Constants";
import { FilterType } from "@app/components/FilterToolbar";
import {
  ConditionalTableBody,
  TableHeaderContentWithControls,
  TableRowContentWithControls,
} from "@app/components/TableControls";
import { RHSeverityShield } from "@app/components/csaf/rh-severity";
import { useDownload } from "@app/hooks/csaf/download-advisory";
import {
  getHubRequestParams,
  useTableControlProps,
  useTableControlState,
} from "@app/hooks/table-controls";
import { useSelectionState } from "@app/hooks/useSelectionState";
import { useFetchAdvisories } from "@app/queries/advisories";

import { AdvisoryDetails } from "./advisory-details";
import { VulnerabilitiesCount } from "./vulnerabilities";

export const useAdvisoryList = () => {
  const tableControlState = useTableControlState({
    tableName: "advisories",
    persistTo: "state",
    persistenceKeyPrefix: TablePersistenceKeyPrefixes.advisories,
    columnNames: {
      id: "ID",
      title: "Title",
      severity: "Aggregated severity",
      revision: "Revision",
      vulnerabilities: "Vulnerabilities",
      download: "Download",
    },
    isFilterEnabled: true,
    filterCategories: [
      {
        categoryKey: "filterText",
        title: "Filter text",
        placeholderText: "Search",
        type: FilterType.search,
      },
      {
        categoryKey: "severity",
        title: "Severity",
        placeholderText: "Severity",
        type: FilterType.multiselect,
        selectOptions: [
          { value: "low", label: "Low" },
          { value: "moderate", label: "Moderate" },
          { value: "important", label: "Important" },
          { value: "critical", label: "Critical" },
        ],
      },
      {
        categoryKey: "package:in",
        title: "Product",
        placeholderText: "Product",
        type: FilterType.multiselect,
        selectOptions: [
          {
            value: "cpe:/o:redhat:rhel_eus:7",
            label: "Red Hat Enterprise Linux 7",
          },
          {
            value: "cpe:/o:redhat:rhel_eus:8",
            label: "Red Hat Enterprise Linux 8",
          },
          {
            value: "cpe:/a:redhat:enterprise_linux:9",
            label: "Red Hat Enterprise Linux 9",
          },
          {
            value: "cpe:/a:redhat:openshift:3",
            label: "Openshift Container Platform 3",
          },
          {
            value: "cpe:/a:redhat:openshift:4",
            label: "Openshift Container Platform 4",
          },
        ],
      },
      {
        categoryKey: "release",
        title: "Revision",
        placeholderText: "Revision",
        type: FilterType.select,
        selectOptions: [
          {
            value: `${dayjs().subtract(7, "day").format(FILTER_DATE_FORMAT)}..${dayjs().format(FILTER_DATE_FORMAT)}`,
            label: "Last 7 days",
          },
          {
            value: `${dayjs().subtract(30, "day").format(FILTER_DATE_FORMAT)}..${dayjs().format(FILTER_DATE_FORMAT)}`,
            label: "Last 30 days",
          },
          {
            value: `${dayjs().startOf("year").format(FILTER_DATE_FORMAT)}..${dayjs().format(FILTER_DATE_FORMAT)}`,
            label: "This year",
          },
          ...[...Array(3)].map((_, index) => {
            const date = dayjs()
              .startOf("year")
              .subtract(index + 1, "year");
            return {
              value: `${date.format(FILTER_DATE_FORMAT)}..${date.endOf("year").format(FILTER_DATE_FORMAT)}`,
              label: date.year().toString(),
            };
          }),
        ],
      },
    ],
    isSortEnabled: true,
    sortableColumns: ["severity"],
    isPaginationEnabled: true,
    isExpansionEnabled: true,
    expandableVariant: "single",
  });

  const {
    result: { data: advisories, total: totalItemCount },
    isFetching,
    fetchError,
  } = useFetchAdvisories(
    getHubRequestParams({
      ...tableControlState,
      hubSortFieldKeys: {
        severity: "severity",
      },
    })
  );

  const tableControls = useTableControlProps({
    ...tableControlState,
    idProperty: "id",
    currentPageItems: advisories,
    totalItemCount,
    isLoading: isFetching,
    selectionState: useSelectionState({
      items: advisories,
      isEqual: (a, b) => a.id === b.id,
    }),
  });

  const {
    numRenderedColumns,
    currentPageItems,
    propHelpers: { tableProps, getThProps, getTrProps, getTdProps },
    expansionDerivedState: { isCellExpanded },
  } = tableControls;

  const { downloadAdvisory } = useDownload();

  const table = (
    <Table {...tableProps} aria-label="Advisories table">
      <Thead>
        <Tr>
          <TableHeaderContentWithControls {...tableControls}>
            <Th {...getThProps({ columnKey: "id" })} />
            <Th {...getThProps({ columnKey: "title" })} />
            <Th {...getThProps({ columnKey: "severity" })} />
            <Th {...getThProps({ columnKey: "revision" })} />
            <Th {...getThProps({ columnKey: "vulnerabilities" })} />
            <Th {...getThProps({ columnKey: "download" })} />
          </TableHeaderContentWithControls>
        </Tr>
      </Thead>
      <ConditionalTableBody
        isLoading={isFetching}
        isError={!!fetchError}
        isNoData={totalItemCount === 0}
        numRenderedColumns={numRenderedColumns}
      >
        {currentPageItems?.map((item, rowIndex) => {
          return (
            <Tbody key={item.id}>
              <Tr {...getTrProps({ item })}>
                <TableRowContentWithControls
                  {...tableControls}
                  item={item}
                  rowIndex={rowIndex}
                >
                  <Td width={15} {...getTdProps({ columnKey: "id" })}>
                    <NavLink to={`/advisories/${item.id}`}>{item.id}</NavLink>
                  </Td>
                  <Td
                    width={45}
                    modifier="truncate"
                    {...getTdProps({ columnKey: "title" })}
                  >
                    {item.title}
                  </Td>
                  <Td width={10} {...getTdProps({ columnKey: "severity" })}>
                    <RHSeverityShield value={item.severity} />
                  </Td>
                  <Td
                    width={10}
                    modifier="truncate"
                    {...getTdProps({ columnKey: "revision" })}
                  >
                    {item.date}
                  </Td>
                  <Td
                    width={10}
                    {...getTdProps({ columnKey: "vulnerabilities" })}
                  >
                    {item.cves.length === 0 ? (
                      "N/A"
                    ) : (
                      <VulnerabilitiesCount
                        severities={item.cve_severity_count}
                      />
                    )}
                  </Td>
                  <Td width={10} {...getTdProps({ columnKey: "download" })}>
                    <Button
                      variant="plain"
                      aria-label="Download"
                      onClick={() => {
                        downloadAdvisory(item.id);
                      }}
                    >
                      <DownloadIcon />
                    </Button>
                  </Td>
                </TableRowContentWithControls>
              </Tr>
              {isCellExpanded(item) ? (
                <Tr isExpanded>
                  <Td colSpan={7}>
                    <ExpandableRowContent>
                      <AdvisoryDetails id={item.id} />
                    </ExpandableRowContent>
                  </Td>
                </Tr>
              ) : null}
            </Tbody>
          );
        })}
      </ConditionalTableBody>
    </Table>
  );

  return {
    data: {
      isFetching,
      fetchError,
      advisories,
      totalItemCount,
    },
    tableControls,
    components: { table },
  };
};
