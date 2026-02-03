/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { LuInbox } from "react-icons/lu";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

export interface Column<T = unknown> {
  title: string;
  dataIndex: string;
  key: string;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  sorter?: boolean | ((a: T, b: T) => number);
  width?: string | number;
  align?: "left" | "center" | "right";
}

export interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  onChange: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
}

export interface ReusableTableProps<T = unknown> {
  // Allow columns to be defined with their own record type (e.g., Column<Student>),
  // so use Column<any>[] to avoid strict generic mismatch during JSX inference.
  columns: Column<any>[];
  dataSource: T[];
  pagination?: PaginationConfig | false;
  loading?: boolean;
  rowKey?: string | ((record: T, index: number) => string);
  size?: "small" | "middle" | "large";
  bordered?: boolean;
  scroll?: { x?: number | string; y?: number | string };
  emptyText?: string;
  className?: string;
  serverSidePagination?: boolean; // New prop
  /** Table layout mode — 'auto' (default) or 'fixed' to respect column widths */
  tableLayout?: "auto" | "fixed";
}

export default function ReusableTable<T extends object = any>({
  columns,
  dataSource,
  pagination = false,
  loading = false,
  rowKey = "key",
  size = "middle",
  bordered = false,
  scroll,
  emptyText = "Tidak ada data",
  className = "",
  serverSidePagination = false,
  tableLayout = "auto",
}: ReusableTableProps<T>) {
  // compute wrapper styles for vertical scroll
  const wrapperStyles: React.CSSProperties = {};
  if (scroll?.y) {
    wrapperStyles.maxHeight =
      typeof scroll.y === "number" ? `${scroll.y}px` : String(scroll.y);
  }

  const tableLayoutClass = tableLayout === "fixed" ? "table-fixed" : "";
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc" | null;
  } | null>(null);

  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === "function") {
      return rowKey(record, index);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const val = (record as any)[rowKey];
    return val !== undefined && val !== null ? String(val) : index.toString();
  };

  const handleSort = (column: Column<T>) => {
    if (!column.sorter) return;

    const key = column.key;
    let direction: "asc" | "desc" | null = "asc";

    if (sortConfig && sortConfig.key === key) {
      if (sortConfig.direction === "asc") {
        direction = "desc";
      } else if (sortConfig.direction === "desc") {
        direction = null;
      }
    }

    setSortConfig(direction ? { key, direction } : null);
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig || !sortConfig.direction) return dataSource;

    const column = columns.find((col) => col.key === sortConfig.key);
    if (!column || !column.sorter) return dataSource;

    const sorter =
      typeof column.sorter === "function"
        ? column.sorter
        : (a: T, b: T) => {
            const aVal = (a as any)[column.dataIndex] as unknown;
            const bVal = (b as any)[column.dataIndex] as unknown;
            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return -1;
            if (bVal == null) return 1;
            if (typeof aVal === "string" && typeof bVal === "string") {
              return aVal.localeCompare(bVal);
            }
            if (aVal < bVal) return -1;
            if (aVal > bVal) return 1;
            return 0;
          };

    return [...dataSource].sort((a, b) => {
      const result = sorter(a, b);
      return sortConfig.direction === "desc" ? -result : result;
    });
  }, [dataSource, sortConfig, columns]);

  const paginatedData = React.useMemo(() => {
    if (!pagination || serverSidePagination) return sortedData;
    const { current, pageSize } = pagination;
    const startIndex = (current - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, pagination, serverSidePagination]);

  const sizeClasses = {
    small: "text-sm",
    middle: "text-base",
    large: "text-lg",
  };

  const borderClasses = bordered ? "border border-gray-300" : "";

  if (loading) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (dataSource.length === 0) {
    return (
      <div
        className={`w-full flex flex-col items-center gap-3 text-center py-12 ${className}`}
      >
        <LuInbox className="text-gray-500 text-5xl" />
        <p className="text-gray-500">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`overflow-x-auto thin-scrollbar ${scroll?.x ? "overflow-x-scroll" : ""} ${scroll?.y ? "overflow-y-auto" : ""}`}
        style={wrapperStyles}
      >
        <table
          className={`w-full min-w-full bg-white ${borderClasses} rounded-lg ${sizeClasses[size]} ${tableLayoutClass}`}
        >
          {columns.some((c) => c.width) && (
            <colgroup>
              {columns.map((col) => (
                <col
                  key={col.key}
                  style={{
                    width:
                      typeof col.width === "number"
                        ? `${col.width}px`
                        : col.width,
                  }}
                />
              ))}
            </colgroup>
          )}

          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sorter ? "cursor-pointer hover:bg-gray-100" : ""
                  } ${column.align === "center" ? "text-center" : column.align === "right" ? "text-right" : "text-left"}`}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex text-center items-center justify-between">
                    <span
                      // className={column.width ? "truncate block" : ""}
                      className={column.width ? "wrap-break-word" : ""}
                      style={
                        column.width
                          ? { width: column.width, maxWidth: column.width }
                          : undefined
                      }
                    >
                      {column.title}
                    </span>
                    {column.sorter && (
                      <span className="ml-2">
                        {sortConfig?.key === column.key
                          ? sortConfig.direction === "asc"
                            ? "↑"
                            : sortConfig.direction === "desc"
                              ? "↓"
                              : "↕"
                          : "↕"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((record, index) => (
              <tr key={getRowKey(record, index)} className="hover:bg-gray-50">
                {columns.map((column) => {
                  const value = (record as any)[column.dataIndex];
                  const renderedValue: React.ReactNode = column.render
                    ? column.render(value, record, index)
                    : (value as any as React.ReactNode);
                  return (
                    <td
                      key={column.key}
                      className={`px-3 py-1 text-sm max-sm:text-xs text-gray-900 ${column.width ? "truncate" : "wrap-break-word whitespace-normal"} ${
                        column.align === "center"
                          ? "text-center"
                          : column.align === "right"
                            ? "text-right"
                            : "text-left"
                      }`}
                      style={
                        column.width
                          ? {
                              width: column.width,
                              maxWidth:
                                typeof column.width === "number"
                                  ? `${column.width}px`
                                  : column.width,
                            }
                          : undefined
                      }
                    >
                      {renderedValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border-t border-gray-200">
          <div className="flex items-center gap-4">
            <span className="text-sm max-sm:text-xs text-gray-700">
              {(pagination.current - 1) * pagination.pageSize + 1} -{" "}
              {Math.min(
                pagination.current * pagination.pageSize,
                pagination.total,
              )}{" "}
              dari {pagination.total} data
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                pagination.onChange(
                  Math.max(1, pagination.current - 1),
                  pagination.pageSize,
                )
              }
              disabled={pagination.current === 1}
              className="flex items-center gap-2 px-3 py-2 text-sm max-sm:text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MdChevronLeft className="w-4 h-4" />
              Sebelumnya
            </button>
            <span className="text-sm max-sm:text-xs text-gray-700">
              {pagination.current} dari{" "}
              {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <button
              onClick={() =>
                pagination.onChange(
                  Math.min(
                    Math.ceil(pagination.total / pagination.pageSize),
                    pagination.current + 1,
                  ),
                  pagination.pageSize,
                )
              }
              disabled={
                pagination.current ===
                Math.ceil(pagination.total / pagination.pageSize)
              }
              className="flex items-center max-sm:text-xs gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Selanjutnya
              <MdChevronRight className="w-4 h-4" />
            </button>
          </div>
          {pagination.showSizeChanger && (
            <div className="flex items-center gap-2">
              <span className="text-sm max-sm:text-xs text-gray-700">
                Data:
              </span>
              <select
                value={pagination.pageSize}
                onChange={(e) => {
                  const newSize = Number(e.target.value);
                  pagination.onChange(1, newSize);
                  pagination.onShowSizeChange?.(1, newSize);
                }}
                className="px-2 py-1 text-sm max-sm:text-xs border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {(pagination.pageSizeOptions || [10, 20, 50, 100]).map(
                  (size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ),
                )}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
