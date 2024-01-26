import { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";

import { getAdvisoryById, getAdvisories } from "@app/api/rest";
import { HubRequestParams } from "@app/api/models";

export const AdvisoriesQueryKey = "advisories";

export const useFetchAdvisories = (params: HubRequestParams = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [AdvisoriesQueryKey, params],
    queryFn: () => getAdvisories(params),
  });
  return {
    result: {
      data: data?.data || [],
      total: data?.total ?? 0,
      params: data?.params ?? params,
    },
    isFetching: isLoading,
    fetchError: error,
    refetch,
  };
};

export const useFetchAdvisoryById = (id?: number | string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: [AdvisoriesQueryKey, id],
    queryFn: () =>
      id === undefined ? Promise.resolve(undefined) : getAdvisoryById(id),
    enabled: id !== undefined,
  });

  return {
    advisory: data,
    isFetching: isLoading,
    fetchError: error as AxiosError,
  };
};
