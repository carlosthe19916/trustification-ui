import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { HubRequestParams } from "@app/api/models";
import { getCveById, getCves } from "@app/api/rest";
import { useWithUiId } from "@app/utils/query-utils";

export const CvesQueryKey = "cves";

export const useFetchCves = (params: HubRequestParams = {}) => {
  const {
    data: cves,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [CvesQueryKey, params],
    queryFn: () => getCves(params),
  });

  const withUiId = useWithUiId(cves?.data, (d) => `${d.document.document.id}`);

  return {
    result: {
      data: withUiId,
      total: cves?.total ?? 0,
      params: cves?.params ?? params,
    },
    isFetching: isLoading,
    fetchError: error,
    refetch,
  };
};

export const useFetchCveById = (id?: number | string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: [CvesQueryKey, id],
    queryFn: () =>
      id === undefined ? Promise.resolve(undefined) : getCveById(id),
    enabled: id !== undefined,
  });

  return {
    advisory: data,
    isFetching: isLoading,
    fetchError: error as AxiosError,
  };
};