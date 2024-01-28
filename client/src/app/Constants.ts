import ENV from "./env";

export const RENDER_DATE_FORMAT = "MMM DD, YYYY";

// URL param prefixes: should be short, must be unique for each table that uses one
export enum TableURLParamKeyPrefix {
  repositories = "r",
  tags = "t",
}

export const isAuthRequired = ENV.AUTH_REQUIRED !== "false";
export const uploadLimit = "500m";
