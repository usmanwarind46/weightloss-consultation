import React from "react";
import { Pagination as MUIPagination } from "@mui/material";
import usePaginationStore from "@/store/pagination";

const Pagination = ({ pagination }) => {
  const { currentPage, setCurrentPage } = usePaginationStore();

  if (!pagination) return null;

  const { last_page } = pagination;

  return (
    <div className="w-full flex justify-center sm:justify-start my-5">
      <MUIPagination
        count={last_page}
        page={currentPage}
        onChange={(event, value) => {
          setCurrentPage(value);
        }}
        color="primary"
        variant="outlined"
        shape="rounded"
        siblingCount={1}
        boundaryCount={1}
      />
    </div>
  );
};

export default Pagination;
