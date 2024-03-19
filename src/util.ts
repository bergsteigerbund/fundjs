import PocketBase from "pocketbase";

const baseUrl =
  import.meta.env.MODE == "development" ? "http://127.0.0.1:8090" : "https://fundsachen.bergsteigerbund.de";
const pb = new PocketBase(baseUrl);

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDatePlusSixMonths = (date: string) => {
  const dateObj = new Date(date);
  dateObj.setMonth(dateObj.getMonth() + 6);
  return dateObj.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export { pb, baseUrl, formatDate, formatDatePlusSixMonths };
