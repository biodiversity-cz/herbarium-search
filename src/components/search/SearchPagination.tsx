import React from 'react';

interface SearchPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Maximum page buttons to show around the current page */
const WINDOW = 2;

/**
 * Pagination control with a sliding window of page buttons.
 * Shows first/last page buttons and ellipsis when the window doesn't reach them.
 */
const SearchPagination: React.FC<SearchPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const pages: (number | 'ellipsis')[] = [];

  const start = Math.max(2, currentPage - WINDOW);
  const end = Math.min(totalPages - 1, currentPage + WINDOW);

  pages.push(1);
  if (start > 2) pages.push('ellipsis');
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages - 1) pages.push('ellipsis');
  if (totalPages > 1) pages.push(totalPages);

  return (
    <nav aria-label="Search results pagination" className="mt-4">
      <ul className="pagination justify-content-center">
        <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            &lsaquo;
          </button>
        </li>

        {pages.map((p, idx) =>
          p === 'ellipsis' ? (
            <li key={`ellipsis-${idx}`} className="page-item disabled">
              <span className="page-link">…</span>
            </li>
          ) : (
            <li key={p} className={`page-item${currentPage === p ? ' active' : ''}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(p)}
                aria-label={`Page ${p}`}
                aria-current={currentPage === p ? 'page' : undefined}
              >
                {p}
              </button>
            </li>
          )
        )}

        <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            &rsaquo;
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default SearchPagination;
