
async function getDashboardData() {
  const response = await fetch(
    "https://script.google.com/macros/s/AKfycbwxa4cEaMF2GV9dY4kjKxbB8wcJdWhPnQUoPYkysiguNVoc1LHxnrUQT9n_5qNBQ8IskQ/exec"
  );

  return await response.json();
}
