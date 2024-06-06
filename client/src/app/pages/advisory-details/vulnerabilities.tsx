import React from "react";
import { NavLink } from "react-router-dom";

import dayjs from "dayjs";

import {
  Card,
  CardBody,
  CardTitle,
  Grid,
  GridItem,
  Label,
  List,
  ListItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";
import {
  ExpandableRowContent,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";

import { RENDER_DATE_FORMAT } from "@app/Constants";
import { Vulnerability } from "@app/api/models";
import { FilterToolbar, FilterType } from "@app/components/FilterToolbar";
import { SimplePagination } from "@app/components/SimplePagination";
import {
  ConditionalTableBody,
  TableHeaderContentWithControls,
  TableRowContentWithControls,
} from "@app/components/TableControls";
import { NotesMarkdown } from "@app/components/csaf/notes-markdown";
import { ProductStatusTree } from "@app/components/csaf/product-status-tree";
import { SeverityRenderer } from "@app/components/csaf/severity-renderer";
import { useLocalTableControls } from "@app/hooks/table-controls";

import { Remediations } from "./remediations";

interface VulnerabilitiesProps {
  isFetching: boolean;
  fetchError: Error;
  vulnerabilities: Vulnerability[];
}

export const Vulnerabilities: React.FC<VulnerabilitiesProps> = ({
  isFetching,
  fetchError,
  vulnerabilities,
}) => {
  const tableControls = useLocalTableControls({
    tableName: "vulnerability-table",
    persistTo: "sessionStorage",
    idProperty: "cve",
    items: vulnerabilities,
    isLoading: isFetching,
    columnNames: {
      cve: "CVE ID",
      title: "Title",
      discovery: "Discovery",
      release: "Release",
      score: "Score",
      cwe: "CWE",
    },
    hasActionsColumn: true,
    isFilterEnabled: true,
    filterCategories: [
      {
        categoryKey: "cve",
        title: "ID",
        type: FilterType.search,
        placeholderText: "Search by ID...",
        getItemValue: (item) => item.cve || "",
      },
    ],
    isSortEnabled: true,
    sortableColumns: ["cve", "discovery", "release"],
    getSortValues: (vuln) => ({
      cve: vuln?.cve || "",
      discovery: vuln ? dayjs(vuln.discovery_date).millisecond() : 0,
      release: vuln ? dayjs(vuln.release_date).millisecond() : 0,
    }),
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
              <Th {...getThProps({ columnKey: "cve" })} />
              <Th {...getThProps({ columnKey: "title" })} />
              <Th {...getThProps({ columnKey: "discovery" })} />
              <Th {...getThProps({ columnKey: "release" })} />
              <Th {...getThProps({ columnKey: "score" })} />
              <Th {...getThProps({ columnKey: "cwe" })} />
            </TableHeaderContentWithControls>
          </Tr>
        </Thead>
        <ConditionalTableBody
          isLoading={isFetching}
          isError={!!fetchError}
          isNoData={vulnerabilities.length === 0}
          numRenderedColumns={numRenderedColumns}
        >
          {currentPageItems?.map((item, rowIndex) => {
            return (
              <Tbody key={item.cve}>
                <Tr {...getTrProps({ item })}>
                  <TableRowContentWithControls
                    {...tableControls}
                    item={item}
                    rowIndex={rowIndex}
                  >
                    <Td width={15} {...getTdProps({ columnKey: "cve" })}>
                      <NavLink to={`/cves/${item.cve}`}>{item.cve}</NavLink>
                    </Td>
                    <Td
                      width={40}
                      modifier="truncate"
                      {...getTdProps({ columnKey: "title" })}
                    >
                      {item.title}
                    </Td>
                    <Td width={10} {...getTdProps({ columnKey: "discovery" })}>
                      {dayjs(item.discovery_date).format(RENDER_DATE_FORMAT)}
                    </Td>
                    <Td width={10} {...getTdProps({ columnKey: "release" })}>
                      {dayjs(item.release_date).format(RENDER_DATE_FORMAT)}
                    </Td>
                    <Td width={15} {...getTdProps({ columnKey: "score" })}>
                      {item.scores.map((e, index) => (
                        <SeverityRenderer
                          key={index}
                          variant="progress"
                          score={e.cvss_v3.baseScore}
                          severity={e.cvss_v3.baseSeverity}
                        />
                      ))}
                    </Td>
                    <Td width={10} {...getTdProps({ columnKey: "cve" })}>
                      {item.cwe?.id || "N/A"}
                    </Td>
                  </TableRowContentWithControls>
                </Tr>
                {isCellExpanded(item) ? (
                  <Tr isExpanded>
                    <Td colSpan={7}>
                      <ExpandableRowContent>
                        <Grid hasGutter>
                          <GridItem md={6}>
                            <Card isFullHeight isCompact isPlain>
                              <CardTitle>Product status</CardTitle>
                              <CardBody>
                                <ProductStatusTree
                                  variant="tree"
                                  branches={item.product_status}
                                />
                              </CardBody>
                            </Card>
                          </GridItem>
                          <GridItem md={6}>
                            <Card isFullHeight isCompact isPlain>
                              <CardTitle>Remediations</CardTitle>
                              <CardBody>
                                <Remediations vulnerabily={item} />
                              </CardBody>
                            </Card>
                          </GridItem>
                          <GridItem md={6}>
                            <Card isFullHeight isCompact isPlain>
                              <CardTitle>IDs</CardTitle>
                              <CardBody>
                                <List>
                                  {item.ids.map((e, index) => (
                                    <ListItem key={index}>
                                      {e.text}({e.system_name})
                                    </ListItem>
                                  ))}
                                </List>
                              </CardBody>
                            </Card>
                          </GridItem>
                          <GridItem md={6}>
                            <Card isFullHeight isCompact isPlain>
                              <CardTitle>References</CardTitle>
                              <CardBody>
                                <List>
                                  {item.references.map((e, index) => (
                                    <ListItem key={index}>
                                      <a
                                        href={e.url}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        {e.summary} <Label>{e.category}</Label>
                                      </a>
                                    </ListItem>
                                  ))}
                                </List>
                              </CardBody>
                            </Card>
                          </GridItem>
                          <GridItem md={12}>
                            <Card isFullHeight isCompact isPlain>
                              <CardTitle>Notes</CardTitle>
                              <CardBody>
                                <NotesMarkdown
                                  notes={item.notes || []}
                                  isCompact
                                />
                              </CardBody>
                            </Card>
                          </GridItem>
                        </Grid>
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
