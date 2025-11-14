// src/data.js
import { makeIndex } from "./lib/utils.js";

const BASE_URL = "https://webinars.webdev.education-services.ru/sp7-api";

export function initData(sourceData) {
  // локальные индексы и данные
  const sellersLocal = makeIndex(
    sourceData.sellers,
    "id",
    (v) => `${v.first_name} ${v.last_name}`
  );
  const customersLocal = makeIndex(
    sourceData.customers,
    "id",
    (v) => `${v.first_name} ${v.last_name}`
  );
  const dataLocal = sourceData.purchase_records.map((item) => ({
    id: item.receipt_id,
    date: item.date,
    seller: sellersLocal[item.seller_id],
    customer: customersLocal[item.customer_id],
    total: item.total_amount,
  }));

  let sellers;
  let customers;
  let lastResult;
  let lastQuery;

  const mapRecords = (records) =>
    records.map((item) => ({
      id: item.receipt_id,
      date: item.date,
      seller: sellers[item.seller_id],
      customer: customers[item.customer_id],
      total: item.total_amount,
    }));

  const getIndexes = async () => {
    if (sellers && customers) return { sellers, customers };
    try {
      const [sResp, cResp] = await Promise.all([
        fetch(`${BASE_URL}/sellers`).then((r) => r.json()),
        fetch(`${BASE_URL}/customers`).then((r) => r.json()),
      ]);
      sellers = sResp;
      customers = cResp;
    } catch (e) {
      sellers = sellersLocal;
      customers = customersLocal;
    }
    return { sellers, customers };
  };

  const getRecords = async (query = {}, isUpdated = false) => {
    const qs = new URLSearchParams(query).toString();
    if (lastQuery === qs && !isUpdated && lastResult) return lastResult;

    try {
      const resp = await fetch(`${BASE_URL}/records?${qs}`);
      if (!resp.ok) throw new Error("network");
      const json = await resp.json();
      if (!sellers || !customers) await getIndexes();
      lastQuery = qs;
      lastResult = {
        total: json.total,
        items: mapRecords(json.items),
      };
      return lastResult;
    } catch (e) {
      // fallback — локальные данные
      let items = [...dataLocal];
      if (query.search) {
        const s = String(query.search).toLowerCase();
        items = items.filter(
          (it) =>
            String(it.seller).toLowerCase().includes(s) ||
            String(it.customer).toLowerCase().includes(s) ||
            String(it.date).toLowerCase().includes(s)
        );
      }
      Object.keys(query).forEach((k) => {
        const m = k.match(/^filter\[(.+)\]$/);
        if (m) {
          const field = m[1];
          const val = String(query[k]).toLowerCase();
          items = items.filter((it) =>
            String(it[field]).toLowerCase().includes(val)
          );
        }
      });
      if (query.sort) {
        const [field, dir] = String(query.sort).split(":");
        items.sort((a, b) => {
          let A = a[field],
            B = b[field];
          if (!isNaN(Date.parse(A)) && !isNaN(Date.parse(B))) {
            A = Date.parse(A);
            B = Date.parse(B);
          } else if (!isNaN(parseFloat(A)) && !isNaN(parseFloat(B))) {
            A = parseFloat(A);
            B = parseFloat(B);
          } else {
            A = String(A).toLowerCase();
            B = String(B).toLowerCase();
          }
          return (A > B ? 1 : A < B ? -1 : 0) * (dir === "desc" ? -1 : 1);
        });
      }
      const limit = parseInt(query.limit) || items.length;
      const page = Math.max(1, parseInt(query.page) || 1);
      const total = items.length;
      const start = (page - 1) * limit;
      const pageItems = items.slice(start, start + limit);
      lastQuery = qs;
      lastResult = { total, items: pageItems };
      return lastResult;
    }
  };

  return {
    getIndexes,
    getRecords,
  };
}
