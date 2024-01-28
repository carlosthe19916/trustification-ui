import React from "react";
import { NavLink } from "react-router-dom";

import {
  ConditionalTableBody,
  FilterType,
  useTablePropHelpers,
  useTableState,
} from "@mturley-latest/react-table-batteries";
import {
  Button,
  PageSection,
  PageSectionVariants,
  Text,
  TextContent,
  ToolbarContent,
} from "@patternfly/react-core";
import {
  Tr as PFTr,
  Td as PFTd,
  ExpandableRowContent,
} from "@patternfly/react-table";
import DownloadIcon from "@patternfly/react-icons/dist/esm/icons/download-icon";

import dayjs from "dayjs";
import { saveAs } from "file-saver";

import { useFetchAdvisories } from "@app/queries/advisories";

import { NotificationsContext } from "@app/components/NotificationsContext";
import { getHubRequestParams } from "@app/hooks/table-controls";
import { formatRustDate, getAxiosErrorMessage } from "@app/utils/utils";
import { downloadAdvisoryById } from "@app/api/rest";

import { RHSeverityShield } from "@app/components/csaf/rh-severity";

import { VulnerabilitiesCount } from "./vulnerabilities";
import { AdvisoryDetails } from "./advisory-details";

const DATE_FORMAT = "YYYY-MM-DD";

export const Advisories: React.FC = () => {
  const { pushNotification } = React.useContext(NotificationsContext);

  const tableState = useTableState({
    persistTo: "urlParams",
    persistenceKeyPrefix: "a",
    columnNames: {
      id: "ID",
      title: "Title",
      severity: "Aggregated severity",
      revision: "Revision",
      vulnerabilities: "Vulnerabilities",
      download: "Download",
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
          key: "severity",
          title: "Severity",
          placeholderText: "Severity",
          type: FilterType.multiselect,
          selectOptions: [
            { key: "low", value: "Low" },
            { key: "moderate", value: "Moderate" },
            { key: "important", value: "Important" },
            { key: "critical", value: "Critical" },
          ],
        },
        {
          key: "package:in",
          title: "Product",
          placeholderText: "Product",
          type: FilterType.multiselect,
          selectOptions: [
            {
              key: "cpe:/o:redhat:rhel_eus:7",
              value: "Red Hat Enterprise Linux 7",
            },
            {
              key: "cpe:/o:redhat:rhel_eus:8",
              value: "Red Hat Enterprise Linux 8",
            },
            {
              key: "cpe:/a:redhat:enterprise_linux:9",
              value: "Red Hat Enterprise Linux 9",
            },
            {
              key: "cpe:/a:redhat:openshift:3",
              value: "Openshift Container Platform 3",
            },
            {
              key: "cpe:/a:redhat:openshift:4",
              value: "Openshift Container Platform 4",
            },
          ],
        },
        {
          key: "release",
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
      sortableColumns: ["severity"],
    },
    pagination: { isEnabled: true },
    expansion: {
      isEnabled: true,
      variant: "single",
      persistTo: "localStorage",
    },
  });

  const { filter, cacheKey } = tableState;
  const hubRequestParams = React.useMemo(() => {
    return getHubRequestParams({
      ...tableState,
      filterCategories: filter.filterCategories,
    });
  }, [cacheKey]);

  const { isFetching, result, fetchError } =
    useFetchAdvisories(hubRequestParams);

  const tableProps = useTablePropHelpers({
    ...tableState,
    idProperty: "id",
    isLoading: isFetching,
    currentPageItems: result.data,
    totalItemCount: result.total,
  });

  const {
    currentPageItems,
    numRenderedColumns,
    expansion: { isCellExpanded },
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
  } = tableProps;

  const downloadAdvisory = (id: string, filename: string) => {
    downloadAdvisoryById(id)
      .then((response) => {
        saveAs(new Blob([response.data]), filename);
      })
      .catch((error) => {
        pushNotification({
          title: getAxiosErrorMessage(error),
          variant: "danger",
        });
      });
  };

  return (
    <>
      <PageSection variant={PageSectionVariants.default}>
        <TextContent>
          <Text component="h1">Advisories</Text>
          {/* <Text component="p">Search security advisories</Text> */}
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
                id="advisory-toolbar"
                {...{ showFiltersSideBySide: true }}
              />
              <PaginationToolbarItem>
                <Pagination
                  variant="top"
                  isCompact
                  widgetId="advisories-pagination-top"
                />
              </PaginationToolbarItem>
            </ToolbarContent>
          </Toolbar>

          <Table aria-label="Advisory details table">
            <Thead>
              <Tr isHeaderRow>
                <Th columnKey="id" />
                <Th columnKey="title" />
                <Th columnKey="severity" />
                <Th columnKey="revision" />
                <Th columnKey="vulnerabilities" />
                <Th columnKey="download" />
              </Tr>
            </Thead>
            <ConditionalTableBody
              isLoading={isFetching}
              isError={!!fetchError}
              isNoData={result.total === 0}
              numRenderedColumns={numRenderedColumns}
            >
              {currentPageItems?.map((item, rowIndex) => {
                return (
                  <Tbody key={item.id}>
                    <Tr item={item} rowIndex={rowIndex}>
                      <Td width={15} columnKey="id">
                        <NavLink to={`/advisories/${item.id}`}>
                          {item.id}
                        </NavLink>
                      </Td>
                      <Td width={45} modifier="truncate" columnKey="title">
                        {item.title}
                      </Td>
                      <Td width={10} columnKey="severity">
                        <RHSeverityShield value={item.severity} />
                      </Td>
                      <Td width={10} modifier="truncate" columnKey="revision">
                        {formatRustDate(item.date)}
                      </Td>
                      <Td width={10} columnKey="vulnerabilities">
                        {item.cves.length === 0 ? (
                          "N/A"
                        ) : (
                          <VulnerabilitiesCount
                            severities={item.cve_severity_count}
                          />
                        )}
                      </Td>
                      <Td width={10} columnKey="download">
                        <Button
                          variant="plain"
                          aria-label="Download"
                          onClick={() => {
                            downloadAdvisory(item.id, `${item.id}.json`);
                          }}
                        >
                          <DownloadIcon />
                        </Button>
                      </Td>
                    </Tr>
                    {isCellExpanded(item) ? (
                      <PFTr isExpanded>
                        <PFTd colSpan={7}>
                          <ExpandableRowContent>
                            <AdvisoryDetails id={item.id} />
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
            widgetId="advisories-pagination-bottom"
          />
        </div>
      </PageSection>
    </>
  );
};
