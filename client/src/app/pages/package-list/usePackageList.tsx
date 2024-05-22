import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";

import { PackageURL } from "packageurl-js";

import { Label } from "@patternfly/react-core";

import { TablePersistenceKeyPrefixes } from "@app/Constants";
import { FilterType } from "@app/components/FilterToolbar";
import {
  ConditionalTableBody,
  TableHeaderContentWithControls,
  TableRowContentWithControls,
} from "@app/components/TableControls";
import {
  getHubRequestParams,
  useTableControlProps,
  useTableControlState,
} from "@app/hooks/table-controls";
import { useSelectionState } from "@app/hooks/useSelectionState";
import { useFetchPackages } from "@app/queries/packages";
import {
  ExpandableRowContent,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";

export const usePackageList = () => {
  const tableControlState = useTableControlState({
    tableName: "packages",
    persistTo: "state",
    persistenceKeyPrefix: TablePersistenceKeyPrefixes.packages,
    columnNames: {
      name: "Name",
      namespace: "Namespace",
      version: "Version",
      type: "Type",
      path: "Path",
      qualifiers: "Qualifiers",
      vulnerabilities: "Vulnerabilities",
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
        categoryKey: "type",
        title: "Type",
        placeholderText: "Type",
        type: FilterType.multiselect,
        selectOptions: [
          { value: "maven", label: "Maven" },
          { value: "rpm", label: "RPM" },
          { value: "npm", label: "NPM" },
          { value: "oci", label: "OCI" },
        ],
      },
      {
        categoryKey: "qualifier:arch",
        title: "Architecture",
        placeholderText: "Architecture",
        type: FilterType.multiselect,
        selectOptions: [
          { value: "x86_64", label: "AMD 64Bit" },
          { value: "aarch64", label: "ARM 64bit" },
          { value: "ppc64le", label: "PowerPC" },
          { value: "s390x", label: "S390" },
        ],
      },
      {
        categoryKey: "supplier",
        title: "Supplier",
        placeholderText: "Supplier",
        type: FilterType.multiselect,
        selectOptions: [{ value: "Organization: Red Hat", label: "Red Hat" }],
      },
    ],
    isSortEnabled: true,
    sortableColumns: [],
    isPaginationEnabled: true,
  });

  const {
    result: { data: packages, total: totalItemCount },
    isFetching,
    fetchError,
  } = useFetchPackages(
    getHubRequestParams({
      ...tableControlState,
      hubSortFieldKeys: {
        created: "created",
      },
    })
  );

  const tableControls = useTableControlProps({
    ...tableControlState,
    idProperty: "purl",
    currentPageItems: packages,
    totalItemCount,
    isLoading: isFetching,
    selectionState: useSelectionState({
      items: packages,
      isEqual: (a, b) => a.purl === b.purl,
    }),
  });

  const {
    numRenderedColumns,
    currentPageItems,
    propHelpers: { getThProps, getTrProps, getTdProps },
    expansionDerivedState: { isCellExpanded },
  } = tableControls;

  const pageItems = useMemo(() => {
    return packages.map((e) => {
      let packageUrl;
      try {
        packageUrl = PackageURL.fromString(e.purl);
      } catch (e) {
        console.log(e);
      }
      return {
        ...e,
        package: packageUrl,
      };
    });
  }, [currentPageItems]);

  const table = (
    <>
      <Table aria-label="Packages details table">
        <Thead>
          <Tr>
            <TableHeaderContentWithControls {...tableControls}>
              <Th {...getThProps({ columnKey: "name" })} />
              <Th {...getThProps({ columnKey: "namespace" })} />
              <Th {...getThProps({ columnKey: "version" })} />
              <Th {...getThProps({ columnKey: "type" })} />
              <Th {...getThProps({ columnKey: "path" })} />
              <Th {...getThProps({ columnKey: "qualifiers" })} />
              <Th {...getThProps({ columnKey: "vulnerabilities" })} />
            </TableHeaderContentWithControls>
          </Tr>
        </Thead>
        <ConditionalTableBody
          isLoading={isFetching}
          isError={!!fetchError}
          isNoData={totalItemCount === 0}
          numRenderedColumns={numRenderedColumns}
        >
          {pageItems?.map((item, rowIndex) => {
            return (
              <Tbody key={item.purl}>
                <Tr {...getTrProps({ item })}>
                  <TableRowContentWithControls
                    {...tableControls}
                    item={item}
                    rowIndex={rowIndex}
                  >
                    <Td width={25} {...getTdProps({ columnKey: "name" })}>
                      <NavLink
                        to={`/packages/${encodeURIComponent(item.purl)}`}
                      >
                        {item.package?.name}
                      </NavLink>
                    </Td>
                    <Td
                      width={10}
                      modifier="truncate"
                      {...getTdProps({ columnKey: "namespace" })}
                    >
                      {item.package?.namespace}
                    </Td>
                    <Td width={15} {...getTdProps({ columnKey: "version" })}>
                      {item.package?.version}
                    </Td>
                    <Td
                      width={10}
                      modifier="truncate"
                      {...getTdProps({ columnKey: "type" })}
                    >
                      {item.package?.type}
                    </Td>
                    <Td
                      width={10}
                      modifier="truncate"
                      {...getTdProps({ columnKey: "path" })}
                    >
                      {item.package?.subpath}
                    </Td>
                    <Td width={20} {...getTdProps({ columnKey: "qualifiers" })}>
                      {Object.entries(item.package?.qualifiers || {}).map(
                        ([k, v], index) => (
                          <Label key={index} isCompact>{`${k}=${v}`}</Label>
                        )
                      )}
                    </Td>
                    <Td
                      width={10}
                      {...getTdProps({ columnKey: "vulnerabilities" })}
                    >
                      N/A
                    </Td>
                  </TableRowContentWithControls>
                </Tr>
                {isCellExpanded(item) ? (
                  <Tr isExpanded>
                    <Td colSpan={7}>
                      <ExpandableRowContent>Expanded area</ExpandableRowContent>
                    </Td>
                  </Tr>
                ) : null}
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
      packages,
      totalItemCount,
    },
    tableControls,
    components: { table },
  };
};
