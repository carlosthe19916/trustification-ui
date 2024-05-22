import React from "react";
import { NavLink } from "react-router-dom";

import dayjs from "dayjs";

import { Button } from "@patternfly/react-core";
import DownloadIcon from "@patternfly/react-icons/dist/esm/icons/download-icon";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";

import {
  getHubRequestParams,
  useTableControlProps,
  useTableControlState,
} from "@app/hooks/table-controls";

import {
  FILTER_DATE_FORMAT,
  RENDER_DATE_FORMAT,
  TablePersistenceKeyPrefixes,
} from "@app/Constants";
import { FilterType } from "@app/components/FilterToolbar";
import {
  ConditionalTableBody,
  TableHeaderContentWithControls,
  TableRowContentWithControls,
} from "@app/components/TableControls";
import { useDownload } from "@app/hooks/csaf/download-advisory";
import { useSelectionState } from "@app/hooks/useSelectionState";
import { useFetchSboms } from "@app/queries/sboms";

export const useSbomList = () => {
  const tableControlState = useTableControlState({
    tableName: "sboms",
    persistTo: "state",
    persistenceKeyPrefix: TablePersistenceKeyPrefixes.packages,
    columnNames: {
      name: "Name",
      version: "Version",
      supplier: "Supplier",
      createdOn: "Created on",
      dependencies: "Dependencies",
      productAdvisories: "Product advisories",
      download: "Download",
      Report: "Report",
    },
    isFilterEnabled: true,
    filterCategories: [
      {
        categoryKey: "filterText",
        title: "Filter text",
        placeholderText: "Search",
        type: FilterType.search,
      },
      // {
      //   key: "pkg",
      //   title: "Product",
      //   type: FilterType.multiselect,
      //   placeholderText: "Product",
      //   selectOptions: [
      //     { key: "oci/ubi8", value: "UBI 8" },
      //     { key: "oci/ubi9", value: "UBI 9" },
      //   ],
      // },
      {
        categoryKey: "supplier",
        title: "Supplier",
        type: FilterType.multiselect,
        placeholderText: "Supplier",
        selectOptions: [{ value: "Organization: Red Hat", label: "Red Hat" }],
      },
      {
        categoryKey: "created",
        title: "Created on",
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
    sortableColumns: ["createdOn"],
    isPaginationEnabled: true,
  });

  const {
    result: { data: sboms, total: totalItemCount },
    isFetching,
    fetchError,
  } = useFetchSboms(
    getHubRequestParams({
      ...tableControlState,
      hubSortFieldKeys: { createdOn: "createdOn" },
    })
  );

  const tableControls = useTableControlProps({
    ...tableControlState,
    idProperty: "id",
    currentPageItems: sboms,
    totalItemCount,
    isLoading: isFetching,
    selectionState: useSelectionState({
      items: sboms,
      isEqual: (a, b) => a.id === b.id,
    }),
  });

  const {
    numRenderedColumns,
    currentPageItems,
    propHelpers: { tableProps, getThProps, getTrProps, getTdProps },
    expansionDerivedState: { isCellExpanded },
  } = tableControls;

  const { downloadSbom } = useDownload();

  const table = (
    <>
      <Table {...tableProps} aria-label="Sboms table">
        <Thead>
          <Tr>
            <TableHeaderContentWithControls {...tableControls}>
              <Th {...getThProps({ columnKey: "name" })} />
              <Th {...getThProps({ columnKey: "version" })} />
              <Th {...getThProps({ columnKey: "supplier" })} />
              <Th {...getThProps({ columnKey: "createdOn" })} />
              <Th {...getThProps({ columnKey: "dependencies" })} />
              <Th {...getThProps({ columnKey: "productAdvisories" })} />
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
                    <Td width={20} {...getTdProps({ columnKey: "name" })}>
                      <NavLink to={`/sboms/${item.id}`}>{item.name}</NavLink>
                    </Td>
                    <Td
                      width={15}
                      modifier="truncate"
                      {...getTdProps({ columnKey: "version" })}
                    >
                      {item.version}
                    </Td>
                    <Td width={20} {...getTdProps({ columnKey: "supplier" })}>
                      {item.supplier}
                    </Td>
                    <Td
                      width={15}
                      modifier="truncate"
                      {...getTdProps({ columnKey: "createdOn" })}
                    >
                      {dayjs(item.created as any).format(RENDER_DATE_FORMAT)}
                    </Td>
                    <Td
                      width={10}
                      {...getTdProps({ columnKey: "dependencies" })}
                    >
                      {item.dependencies}
                    </Td>
                    <Td
                      width={10}
                      {...getTdProps({ columnKey: "productAdvisories" })}
                    >
                      {item.advisories}
                    </Td>
                    <Td width={10} {...getTdProps({ columnKey: "download" })}>
                      <Button
                        variant="plain"
                        aria-label="Download"
                        onClick={() => {
                          downloadSbom(item.id);
                        }}
                      >
                        <DownloadIcon />
                      </Button>
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

  return {
    data: {
      isFetching,
      fetchError,
      sboms,
      totalItemCount,
    },
    tableControls,
    components: { table },
  };
};
