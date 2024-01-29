import axios, { AxiosRequestConfig } from "axios";
import {
  HubPaginatedResult,
  HubRequestParams,
  New,
  AdvisoryIndexed,
  Advisory,
  CveIndexed,
  Cve,
  SbomIndexed,
  Sbom,
  PackageIndexed,
  Package,
} from "./models";
import { serializeRequestParamsForHub } from "@app/hooks/table-controls";

const HUB = "/hub";

export const ADVISORIES = HUB + "/api/v1/advisory";
export const CVEs = HUB + "/api/v1/cve";
export const SBOMs = HUB + "/api/v1/sbom";
export const PACKAGES = HUB + "/api/v1/package";

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

export const getCves = (params: HubRequestParams = {}) => {
  return getHubPaginatedResult<CveIndexed>(`${CVEs}`, params);
};

export const getCveById = (id: number | string) => {
  return axios.get<Cve>(`${CVEs}?id=${id}`).then((response) => response.data);
};

export const downloadCveById = (id: number | string) => {
  return axios.get(`${CVEs}?id=${id}`, {
    responseType: "arraybuffer",
    headers: { Accept: "text/plain", responseType: "blob" },
  });
};

export const getSboms = (params: HubRequestParams = {}) => {
  return getHubPaginatedResult<SbomIndexed>(`${SBOMs}/search`, params);
};

export const getSbomById = (id: number | string) => {
  return axios.get<Sbom>(`${SBOMs}?id=${id}`).then((response) => response.data);
};

export const downloadSbomById = (id: number | string) => {
  return axios.get(`${SBOMs}?id=${id}`, {
    responseType: "arraybuffer",
    headers: { Accept: "text/plain", responseType: "blob" },
  });
};

export const getPackages = (params: HubRequestParams = {}) => {
  return getHubPaginatedResult<PackageIndexed>(`${PACKAGES}/search`, params);
};

export const getPackageById = (id: number | string) => {
  return axios
    .get<Package>(`${PACKAGES}?id=${id}`)
    .then((response) => response.data);
};
