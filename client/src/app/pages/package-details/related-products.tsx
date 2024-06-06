import React from "react";
import { NavLink } from "react-router-dom";

import { AxiosError } from "axios";

import { Skeleton } from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";

import { SbomIndexed } from "@app/api/models";
import { SimplePagination } from "@app/components/SimplePagination";
import {
  ConditionalTableBody,
  TableHeaderContentWithControls,
  TableRowContentWithControls,
} from "@app/components/TableControls";
import { useLocalTableControls } from "@app/hooks/table-controls";
import { useFetchPackageRelatedProducts } from "@app/queries/packages";
import { useFetchSbomIndexedByUId } from "@app/queries/sboms";

interface RelatedProductsProps {
  packageId: string;
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({
  packageId,
}) => {
  const { relatedProducts, isFetching, fetchError } =
    useFetchPackageRelatedProducts(packageId);

  const tableControls = useLocalTableControls({
    tableName: "related-products-table",
    persistTo: "sessionStorage",
    idProperty: "sbom_uid",
    items: relatedProducts?.related_products || [],
    isLoading: isFetching,
    columnNames: {
      name: "Name",
      version: "Version",
      supplier: "Supplier",
      dependency: "Dependency",
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
        aria-label="Related products table"
        className="vertical-aligned-table"
      >
        <Thead>
          <Tr>
            <TableHeaderContentWithControls {...tableControls}>
              <Th {...getThProps({ columnKey: "name" })} />
              <Th {...getThProps({ columnKey: "version" })} />
              <Th {...getThProps({ columnKey: "supplier" })} />
              <Th {...getThProps({ columnKey: "dependency" })} />
            </TableHeaderContentWithControls>
          </Tr>
        </Thead>
        <ConditionalTableBody
          isLoading={isFetching}
          isError={!!fetchError}
          isNoData={relatedProducts?.related_products?.length === 0}
          numRenderedColumns={numRenderedColumns}
        >
          {currentPageItems?.map((item, rowIndex) => {
            return (
              <Tbody key={item.sbom_uid} isExpanded={isCellExpanded(item)}>
                <Tr {...getTrProps({ item })}>
                  <TableRowContentWithControls
                    {...tableControls}
                    item={item}
                    rowIndex={rowIndex}
                  >
                    <TdWrapper sbom_uid={item.sbom_uid}>
                      {(sbom, isFetching, fetchError) => (
                        <>
                          {isFetching ? (
                            <Td width={100} colSpan={4}>
                              <Skeleton />
                            </Td>
                          ) : (
                            <>
                              <Td
                                width={45}
                                {...getTdProps({ columnKey: "name" })}
                              >
                                <NavLink to={`/sboms/${sbom?.id}`}>
                                  {sbom?.name}
                                </NavLink>
                              </Td>
                              <Td
                                width={15}
                                modifier="truncate"
                                {...getTdProps({ columnKey: "version" })}
                              >
                                {sbom?.version}
                              </Td>
                              <Td
                                width={25}
                                modifier="truncate"
                                {...getTdProps({ columnKey: "supplier" })}
                              >
                                {sbom?.supplier}
                              </Td>
                              <Td
                                width={15}
                                modifier="truncate"
                                {...getTdProps({ columnKey: "dependency" })}
                              >
                                {/* // TODO */}
                                Direct
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
        idPrefix="related-products-table"
        isTop={false}
        isCompact
        paginationProps={paginationProps}
      />
    </>
  );
};

const TdWrapper = ({
  sbom_uid,
  children,
}: {
  sbom_uid: string;
  children: (
    sbom: SbomIndexed | undefined,
    isFetching: boolean,
    fetchError: AxiosError
  ) => React.ReactNode;
}) => {
  const { sbom, isFetching, fetchError } = useFetchSbomIndexedByUId(sbom_uid);
  return children(sbom, isFetching, fetchError);
};
