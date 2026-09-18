import React from "react";
import { Pagination as MUIPagination } from "@mui/material";
import usePaginationStore from "@/store/pagination";

const Pagination = ({ pagination }) => {
  const { currentPage, setCurrentPage } = usePaginationStore();

  if (!pagination) return null;

  const lastPage = Number(pagination?.last_page) || 1;

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Page info */}
      <p className="inter-reg-font text-center text-[12.5px] text-slate-400 sm:text-left">
        Page <span className="inter-semibold-font text-slate-700">{currentPage}</span> of{" "}
        <span className="inter-semibold-font text-slate-700">{lastPage}</span>
      </p>

      {/* Controls */}
      <div className="flex w-full justify-center overflow-hidden sm:hidden">
        <MUIPagination
          count={lastPage}
          page={currentPage}
          onChange={(_, v) => setCurrentPage(v)}
          variant="text"
          shape="rounded"
          siblingCount={0}
          boundaryCount={0}
          sx={{
            maxWidth: "100%",
            "& .MuiPagination-ul": {
              flexWrap: "nowrap",
              justifyContent: "center",
              gap: "2px",
            },
            "& .MuiPaginationItem-root": {
              minWidth: "30px",
              height: "30px",
              margin: 0,
              padding: "0 4px",
              borderRadius: "7px",
              border: "1px solid #e2e8f0",
              fontFamily: "var(--inter-medium)",
              fontSize: "11.5px",
              color: "#64748b",
              backgroundColor: "#ffffff",
            },
            "& .MuiPaginationItem-root.Mui-selected": {
              backgroundColor: "#4565BF",
              borderColor: "#4565BF",
              color: "#ffffff",
              fontFamily: "var(--inter-semibold)",
            },
            "& .MuiPaginationItem-icon": {
              fontSize: "15px",
            },
            "& .Mui-disabled": {
              opacity: 0.4,
              backgroundColor: "#f8fafc",
            },
          }}
        />
      </div>

      <div className="hidden sm:block">
      <MUIPagination
        count={lastPage}
        page={currentPage}
        onChange={(_, v) => setCurrentPage(v)}
        variant="text"
        shape="rounded"
        siblingCount={1}
        boundaryCount={1}
        showFirstButton
        showLastButton
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          "@media (min-width: 600px)": {
            width: "auto",
          },
          "& .MuiPagination-ul": {
            flexWrap: "nowrap",
            gap: "4px",
            justifyContent: "center",
          },
          "& .MuiPaginationItem-root": {
            minWidth: "34px",
            height: "34px",
            margin: 0,
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            fontFamily: "var(--inter-medium)",
            fontSize: "12.5px",
            color: "#64748b",
            backgroundColor: "#ffffff",
            transition: "all 150ms ease",
            "&:hover": {
              backgroundColor: "#f8fafc",
              borderColor: "#cbd5e1",
              color: "#0f172a",
            },
          },
          "& .MuiPaginationItem-root.Mui-selected": {
            backgroundColor: "#4565BF",
            borderColor: "#4565BF",
            color: "#ffffff",
            fontFamily: "var(--inter-semibold)",
            "&:hover": {
              backgroundColor: "#3550a0",
              borderColor: "#3550a0",
            },
          },
          "& .MuiPaginationItem-icon": {
            fontSize: "16px",
          },
          "& .MuiPaginationItem-firstLast, & .MuiPaginationItem-previousNext": {
            color: "#64748b",
          },
          "& .Mui-disabled": {
            opacity: 0.4,
            backgroundColor: "#f8fafc",
          },
          "@media (max-width: 599px)": {
            "& .MuiPagination-ul": {
              gap: "2px",
            },
            "& .MuiPaginationItem-root": {
              minWidth: "28px",
              height: "30px",
              padding: "0 4px",
              borderRadius: "7px",
              fontSize: "11.5px",
            },
            "& .MuiPaginationItem-firstLast": {
              display: "none",
            },
            "& .MuiPaginationItem-icon": {
              fontSize: "15px",
            },
          },
        }}
      />
      </div>
    </div>
  );
};

export default Pagination;
