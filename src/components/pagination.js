export const initPagination = ({ pages, fromRow, toRow, totalRows }, createPage) => {
  const pageTemplate = pages.firstElementChild.cloneNode(true);
  pages.firstElementChild.remove();

  const applyPagination = (query, state, action) => {
    const limit = state.rowsPerPage;
    let page = state.page;
    if (action && action.type === "pageChange" && action.page) {
      page = action.page;
    }
    return Object.assign({}, query, { limit, page });
  };

  const updatePagination = (total, { page, limit }) => {
    const pageCount = Math.ceil(total / limit);
    pages.replaceChildren();
    for (let p = 1; p <= pageCount; p++) {
      const btn = pageTemplate.cloneNode(true);
      const input = btn.querySelector("input");
      const label = btn.querySelector("span");
      input.value = p;
      input.checked = p === page;
      label.textContent = p;
      pages.appendChild(btn);
    }

    const from = (page - 1) * limit + 1;
    const to = Math.min(total, page * limit);
    fromRow.textContent = from;
    toRow.textContent = to;
    totalRows.textContent = total;
  };

  return { applyPagination, updatePagination };
};
