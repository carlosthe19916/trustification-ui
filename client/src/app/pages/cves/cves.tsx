import React from "react";
import { NavLink } from "react-router-dom";

import {
  ConditionalTableBody,
  FilterType,
  useTablePropHelpers,
  useTableState,
} from "@mturley-latest/react-table-batteries";
import {
  PageSection,
  PageSectionVariants,
  Text,
  TextContent,
  ToolbarContent
} from "@patternfly/react-core";

import dayjs from "dayjs";

import { NotificationsContext } from "@app/components/NotificationsContext";
import { getHubRequestParams } from "@app/hooks/table-controls";

import {
  RENDER_DATE_FORMAT,
  TablePersistenceKeyPrefixes,
} from "@app/Constants";
import { SeverityRenderer } from "@app/components/csaf/severity-renderer";
import { useDownloadAdvisory } from "@app/hooks/csaf/download-advisory";
import { useFetchCves } from "@app/queries/cves";

const DATE_FORMAT = "YYYY-MM-DD";

export const Cves: React.FC = () => {
  const { pushNotification } = React.useContext(NotificationsContext);

  const tableState = useTableState({
    persistTo: "sessionStorage",
    persistenceKeyPrefix: TablePersistenceKeyPrefixes.cves,
    columnNames: {
      id: "ID",
      description: "Description",
      cvss: "CVSS",
      datePublished: "Date published",
      relatedDocuments: "Related documents",
    },
    filter: {
      isEnabled: true,
      filterCategories: [
        {
          key: "filterText",
          title: "Filter text",
          placeholderText: "Search",
          type: FilterType.search,
        },
        {
          key: "state:is",
          title: "State",
          placeholderText: "State",
          type: FilterType.select,
          selectOptions: [
            { key: "published", value: "Published" },
            { key: "rejected", value: "Rejected" },
          ],
        },
        {
          key: "severity",
          title: "CVSS",
          placeholderText: "CVSS",
          type: FilterType.multiselect,
          selectOptions: [
            { key: "low", value: "Low" },
            { key: "moderate", value: "Moderate" },
            { key: "important", value: "Important" },
            { key: "critical", value: "Critical" },
          ],
        },
        {
          key: "datePublished",
          title: "Revision",
          placeholderText: "Revision",
          type: FilterType.select,
          selectOptions: [
            {
              key: `${dayjs().subtract(7, "day").format(DATE_FORMAT)}..${dayjs().format(DATE_FORMAT)}`,
              value: "Last 7 days",
            },
            {
              key: `${dayjs().subtract(30, "day").format(DATE_FORMAT)}..${dayjs().format(DATE_FORMAT)}`,
              value: "Last 30 days",
            },
            {
              key: `${dayjs().startOf("year").format(DATE_FORMAT)}..${dayjs().format(DATE_FORMAT)}`,
              value: "This year",
            },
            ...[...Array(3)].map((_, index) => {
              let date = dayjs()
                .startOf("year")
                .subtract(index + 1, "year");
              return {
                key: `${date.format(DATE_FORMAT)}..${date.endOf("year").format(DATE_FORMAT)}`,
                value: date.year(),
              };
            }),
          ],
        },
      ],
    },
    sort: {
      isEnabled: true,
      sortableColumns: ["cvss", "datePublished"],
      persistTo: "state",
    },
    pagination: { isEnabled: true },
  });

  const { filter, cacheKey } = tableState;
  const hubRequestParams = React.useMemo(() => {
    return getHubRequestParams({
      ...tableState,
      filterCategories: filter.filterCategories,
      hubSortFieldKeys: {
        cvss: "score",
        datePublished: "datePublished",
      },
    });
  }, [cacheKey]);

  const { isFetching, result, fetchError } = useFetchCves(hubRequestParams);

  const tableProps = useTablePropHelpers({
    ...tableState,
    idProperty: "_ui_unique_id",
    isLoading: isFetching,
    currentPageItems: result.data,
    totalItemCount: result.total,
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
    expansion: { isCellExpanded },
  } = tableProps;

  const downloadAdvisory = useDownloadAdvisory();

  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <TextContent>
          <Text component="h1">CVEs</Text>
          {/* <Text component="p">Search for CVEs</Text> */}
        </TextContent>
      </PageSection>
      <PageSection>
        <div
          style={{
            backgroundColor: "var(--pf-v5-global--BackgroundColor--100)",
          }}
        >
          <Toolbar>
            <ToolbarContent>
              <FilterToolbar
                id="cve-toolbar"
                {...{ showFiltersSideBySide: true }}
              />
              <PaginationToolbarItem>
                <Pagination
                  variant="top"
                  isCompact
                  widgetId="cve-pagination-top"
                />
              </PaginationToolbarItem>
            </ToolbarContent>
          </Toolbar>

          <Table aria-label="CVE details table">
            <Thead>
              <Tr isHeaderRow>
                <Th columnKey="id" />
                <Th columnKey="description" />
                <Th columnKey="cvss" />
                <Th columnKey="datePublished" />
                <Th columnKey="relatedDocuments" />
              </Tr>
            </Thead>
            <ConditionalTableBody
              isLoading={isFetching}
              isError={!!fetchError}
              isNoData={result.total === 0}
              numRenderedColumns={numRenderedColumns}
            >
              <Tbody>
                {currentPageItems?.map((item, rowIndex) => {
                  return (
                    <Tr
                      key={item.document.document.id}
                      item={item}
                      rowIndex={rowIndex}
                    >
                      <Td width={15} columnKey="id">
                        <NavLink to={`/cves/${item.document.document.id}`}>
                          {item.document.document.id}
                        </NavLink>
                      </Td>
                      <Td
                        width={50}
                        modifier="truncate"
                        columnKey="description"
                      >
                        {item.document.document.title ||
                          item.document.document.descriptions}
                      </Td>
                      <Td width={15} columnKey="cvss">
                        {item.document.document.cvss3x_score !== null &&
                          item.document.document.cvss3x_score !== undefined && (
                            <SeverityRenderer
                              variant="progress"
                              score={item.document.document.cvss3x_score}
                            />
                          )}
                      </Td>
                      <Td
                        width={10}
                        modifier="truncate"
                        columnKey="datePublished"
                      >
                        {dayjs(item.document.document.date_published).format(
                          RENDER_DATE_FORMAT
                        )}
                      </Td>
                      <Td width={10} columnKey="relatedDocuments">
                        {item.document.related_products}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </ConditionalTableBody>
          </Table>
          <Pagination
            variant="bottom"
            isCompact
            widgetId="advisories-pagination-bottom"
          />
        </div>
      </PageSection>
    </>
  );
};
