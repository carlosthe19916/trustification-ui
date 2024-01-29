import { saveAs } from "file-saver";
import { downloadAdvisoryById, downloadSbomById } from "@app/api/rest";

export const useDownloadAdvisory = () => {
  const downloadAdvisory = (id: string, filename?: string) => {
    downloadAdvisoryById(id).then((response) => {
      saveAs(new Blob([response.data]), filename || `${id}.json`);
    });
  };

  const downloadSbom = (id: string, filename?: string) => {
    downloadSbomById(id).then((response) => {
      saveAs(new Blob([response.data]), filename || `${id}.json`);
    });
  };

  return { downloadAdvisory, downloadSbom };
};
