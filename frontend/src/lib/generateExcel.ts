import * as XLSX from "xlsx";

export function generateExcelFile(
  data: Record<string, unknown>[],
) {

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  XLSX.writeFile(workbook, "export.xlsx");
}
