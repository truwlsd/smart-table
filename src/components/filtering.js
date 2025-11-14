export function initFiltering(elements) {
  const updateIndexes = (elements, indexes) => {
    Object.keys(indexes).forEach((elementName) => {
      const target = elements[elementName];
      if (!target) return;
      target.innerHTML = '<option value=""></option>';
      Object.entries(indexes[elementName]).forEach(([id, name]) => {
        const el = document.createElement("option");
        el.textContent = name;
        el.value = name;
        target.appendChild(el);
      });
    });
  };

  const applyFiltering = (query, state, action) => {
    const filter = {};
    Object.keys(elements).forEach((key) => {
      const el = elements[key];
      if (!el) return;
      if (["INPUT", "SELECT"].includes(el.tagName) && el.value) {
        filter[`filter[${el.name}]`] = el.value;
      }
    });
    return Object.keys(filter).length
      ? Object.assign({}, query, filter)
      : query;
  };

  return { updateIndexes, applyFiltering };
}
