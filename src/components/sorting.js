export function initSorting(columns) {
  return (query, state, action) => {
    const sortState = state.sort || {};
    const field = sortState.field;
    const order = sortState.order;
    const sort =
      field && order && order !== "none" ? `${field}:${order}` : null;
    return sort ? Object.assign({}, query, { sort }) : query;
  };
}
