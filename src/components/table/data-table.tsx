"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type ColumnDef<T> = {
  key: keyof T | string;
  header: string;
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
};

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowId?: (row: T, index: number) => string | number;
  pageSize?: number;
  pageSizeOptions?: number[];
  className?: string;
  emptyState?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  getRowId,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20],
  className,
  emptyState = "Tidak ada data",
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(pageSize);

  const totalRows = data.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);

  React.useEffect(() => {
    // Reset to first page when page size changes or data shrinks
    if (currentPage > totalPages) setCurrentPage(1);
  }, [rowsPerPage, totalRows, totalPages, currentPage]);

  const pageData = React.useMemo(() => data.slice(startIndex, endIndex), [data, startIndex, endIndex]);

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-slate-600">
            {columns.map((col) => (
              <th key={String(col.key)} className={cn("px-3 py-2 text-left font-medium", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageData.length === 0 ? (
            <tr>
              <td className="px-3 py-4 text-center text-slate-500" colSpan={columns.length}>
                {emptyState}
              </td>
            </tr>
          ) : (
            pageData.map((row, i) => {
              const idx = startIndex + i;
              const rowId = getRowId ? getRowId(row, idx) : idx;
              return (
                <tr key={rowId} className="border-t">
                  {columns.map((col) => (
                    <td key={String(col.key)} className={cn("px-3 py-2 align-middle", col.className)}>
                      {col.render ? col.render(row, idx) : String(row[col.key as keyof T] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Pagination footer */}
      <div className="mt-3 flex flex-col items-start gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-slate-600">
          Menampilkan {totalRows === 0 ? 0 : startIndex + 1}–{endIndex} dari {totalRows}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600">
            Baris per halaman
            <select
              className="ml-2 rounded border px-2 py-1 text-xs"
              value={rowsPerPage}
              onChange={(e) => {
                const next = Number(e.target.value);
                setRowsPerPage(next);
                setCurrentPage(1);
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          <div className="text-xs text-slate-600">Halaman {currentPage} / {totalPages}</div>
          <Button variant="outline" size="sm" onClick={handlePrev} disabled={currentPage === 1}>
            Prev
          </Button>
          <Button size="sm" onClick={handleNext} disabled={currentPage === totalPages || totalRows === 0}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
