const API_URL =
"https://script.google.com/macros/s/AKfycbwxa4cEaMF2GV9dY4kjKxbB8wcJdWhPnQUoPYkysiguNVoc1LHxnrUQT9n_5qNBQ8IskQ/exec";

async function getDashboardData() {

  const res = await fetch(
    `${API_URL}?action=dashboard`
  );

  return await res.json();
}
