import axios, { AxiosRequestConfig } from "axios";
import {
  HubPaginatedResult,
  HubRequestParams,
  New,
  AdvisoryIndexed,
  Advisory,
} from "./models";
import { serializeRequestParamsForHub } from "@app/hooks/table-controls";

const HUB = "/hub";

export const ADVISORIES = HUB + "/api/v1/advisory";

interface ApiSearchResult<T> {
  total: number;
  result: T[];
}

export const getHubPaginatedResult = <T>(
  url: string,
  params: HubRequestParams = {}
): Promise<HubPaginatedResult<T>> =>
  axios
    .get<ApiSearchResult<T>>(url, {
      params: serializeRequestParamsForHub(params),
    })
    .then(({ data }) => ({
      data: data.result,
      total: data.total,
      params,
    }));

export const getAdvisories = (params: HubRequestParams = {}) => {
  return getHubPaginatedResult<AdvisoryIndexed>(`${ADVISORIES}/search`, params);
};

export const getAdvisoryById = (id: number | string) => {
  return axios
    .get<Advisory>(`${ADVISORIES}?id=${id}`)
    .then((response) => response.data);
};

export const downloadAdvisoryById = (id: number | string) => {
  return axios.get(`${ADVISORIES}?id=${id}`, {
    responseType: "arraybuffer",
    headers: { Accept: "text/plain", responseType: "blob" },
  });
};
