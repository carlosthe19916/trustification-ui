import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { HubRequestParams } from "@app/api/models";
import { getSbomById, getSboms } from "@app/api/rest";

export const SbomsQueryKey = "sboms";

export const useFetchSboms = (params: HubRequestParams = {}) => {
  const {
    data: cves,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [SbomsQueryKey, params],
    queryFn: () => getSboms(params),
  });

  return {
    result: {
      data: cves?.data || [],
      total: cves?.total ?? 0,
      params: cves?.params ?? params,
    },
    isFetching: isLoading,
    fetchError: error,
    refetch,
  };
};

export const useFetchSbomById = (id?: number | string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: [SbomsQueryKey, id],
    queryFn: () =>
      id === undefined ? Promise.resolve(undefined) : getSbomById(id),
    enabled: id !== undefined,
  });

  return {
    sbom: data,
    isFetching: isLoading,
    fetchError: error as AxiosError,
  };
};
