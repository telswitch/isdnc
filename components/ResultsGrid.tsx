"use client";

/**
 * Reusable responsive data grid.
 *
 * Dynamically renders columns based on the keys of the first row in `data`.
 * No column configuration required — adapts to any stored procedure result set.
 *
 * Features:
 *  - Horizontally scrollable on mobile (overflow-x-auto wrapper)
 *  - Row count displayed above the table
 *  - "No results found" empty state
 *  - Handles null/undefined cell values gracefully
 *
 * Props:
 *  - data:    Array of row objects (any shape). All rows should share the same keys.
 *  - title:   Optional heading displayed above the row count.
 */

interface ResultsGridProps {
  data: Record<string, unknown>[];
  title?: string;
}

export default function ResultsGrid({ data, title }: ResultsGridProps) {
  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <svg
          className="mx-auto h-10 w-10 text-gray-300 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-sm text-gray-500 font-medium">No results found</p>
        <p className="text-xs text-gray-400 mt-1">
          Try a different phone number or date.
        </p>
      </div>
    );
  }

  // Derive column names from the first row
  const columns = Object.keys(data[0]);

  /**
   * Format a cell value for display.
   * Converts Date objects to locale strings; renders everything else as a string.
   */
  function formatCell(value: unknown): string {
    if (value === null || value === undefined) return "—";
    if (value instanceof Date) return value.toLocaleString();
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  }

  return (
    <div>
      {/* Header: optional title + row count */}
      <div className="flex items-baseline justify-between mb-3">
        {title && (
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        )}
        <p className="text-sm text-gray-500 ml-auto">
          {data.length} {data.length === 1 ? "row" : "rows"} returned
        </p>
      </div>

      {/* Horizontally scrollable table wrapper — critical for mobile */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 transition-colors duration-75"
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    className="px-4 py-3 text-gray-700 whitespace-nowrap"
                  >
                    {formatCell(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
