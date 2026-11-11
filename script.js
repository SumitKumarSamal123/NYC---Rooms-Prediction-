const form = document.querySelector("#prediction-form");
const formError = document.querySelector("#form-error");
const predictButton = document.querySelector(".predict-button");
const resultContent = document.querySelector("#result-content");
const loadingState = document.querySelector("#loading-state");
const predictionResult = document.querySelector("#prediction-result");
const boroughSelect = document.querySelector("#neighbourhood_group");
const neighborhoodInput = document.querySelector("#neighbourhood");

const examples = {
  Manhattan: { neighbourhood: "Harlem", latitude: 40.8116, longitude: -73.9465, price: 180, minimum_nights: 2, number_of_reviews: 42, reviews_per_month: 1.2, calculated_host_listings_count: 1, availability_365: 250 },
  Brooklyn: { neighbourhood: "Williamsburg", latitude: 40.7081, longitude: -73.9571, price: 145, minimum_nights: 3, number_of_reviews: 68, reviews_per_month: 1.8, calculated_host_listings_count: 2, availability_365: 190 },
  Queens: { neighbourhood: "Astoria", latitude: 40.7644, longitude: -73.9235, price: 105, minimum_nights: 2, number_of_reviews: 34, reviews_per_month: 1.1, calculated_host_listings_count: 1, availability_365: 280 },
  Bronx: { neighbourhood: "Mott Haven", latitude: 40.8089, longitude: -73.9229, price: 90, minimum_nights: 2, number_of_reviews: 19, reviews_per_month: 0.7, calculated_host_listings_count: 1, availability_365: 220 },
  "Staten Island": { neighbourhood: "St. George", latitude: 40.6437, longitude: -74.0776, price: 110, minimum_nights: 2, number_of_reviews: 16, reviews_per_month: 0.5, calculated_host_listings_count: 1, availability_365: 200 }
};

function showExample() {
  const sample = examples[boroughSelect.value] || examples.Manhattan;
  for (const [name, value] of Object.entries(sample)) {
    const input = form.elements.namedItem(name);
    if (input) input.value = value;
  }
  formError.textContent = "";
  neighborhoodInput.focus();
}

function displayResult(data) {
  const prediction = data.Predicted_room_type ?? data.predicted_room_type ?? data.prediction;
  const probabilities = data.Probability ?? data.probability ?? data.probabilities;
  if (prediction === undefined) throw new Error("The API response did not include a predicted room type.");

  const classNames = data.Classes ?? data.classes ?? data.class_names ?? [];
  const items = Array.isArray(probabilities)
    ? probabilities.map((value, index) => ({ label: classNames[index] ?? `Class ${index + 1}`, value: Number(value) }))
    : probabilities && typeof probabilities === "object"
      ? Object.entries(probabilities).map(([label, value]) => ({ label, value: Number(value) }))
      : [];
  const total = items.reduce((sum, item) => sum + (Number.isFinite(item.value) ? item.value : 0), 0);
  const confidence = items.length ? Math.max(...items.map(item => item.value)) : null;
  const confidencePct = confidence === null ? null : Math.round((confidence <= 1 ? confidence : confidence / 100) * 100);
  const sortedItems = [...items].sort((a, b) => b.value - a.value);
  const bars = sortedItems.map((item, index) => {
    const normalized = total > 1.5 ? item.value / 100 : item.value;
    const pct = Math.max(0, Math.min(100, normalized * 100));
    return `<div class="probability-row"><span>${escapeHtml(item.label)}</span><span class="probability-bar"><i style="width:${pct}%"></i></span><strong>${Math.round(pct)}%</strong></div>`;
  }).join("");

  predictionResult.innerHTML = `
    <div class="prediction-kicker">✦ &nbsp; MOST LIKELY MATCH</div>
    <div class="prediction-type">${escapeHtml(String(prediction))}</div>
    <p class="prediction-caption">Based on the listing details you shared</p>
    ${confidencePct === null ? "" : `<div class="confidence-heading"><span>Model confidence</span><strong>${confidencePct}%</strong></div><div class="confidence-track"><div class="confidence-fill" style="width:${confidencePct}%"></div></div>`}
    ${bars ? `<div class="probability-list">${bars}</div>` : ""}
    <button class="result-again" type="button" id="edit-again">↻ &nbsp; Edit details and try again</button>`;
  resultContent.hidden = true;
  loadingState.hidden = true;
  predictionResult.hidden = false;
  document.querySelector("#edit-again").addEventListener("click", () => {
    predictionResult.hidden = true;
    resultContent.hidden = false;
    neighborhoodInput.focus();
  });
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

boroughSelect.addEventListener("change", showExample);
document.querySelector("#sample-button").addEventListener("click", showExample);

form.addEventListener("submit", async event => {
  event.preventDefault();
  formError.textContent = "";
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  for (const [key, value] of Object.entries(payload)) {
    if (key !== "neighbourhood_group" && key !== "neighbourhood") payload[key] = Number(value);
  }

  predictButton.disabled = true;
  predictButton.querySelector(".button-label").textContent = "Analyzing listing...";
  resultContent.hidden = true;
  predictionResult.hidden = true;
  loadingState.hidden = false;
  try {
    const response = await fetch("https://nyc-rooms-prediction.onrender.com/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = data.detail;
      throw new Error(Array.isArray(detail) ? detail.map(item => item.msg).join("; ") : detail || `Request failed (${response.status}).`);
    }
    displayResult(data);
  } catch (error) {
    loadingState.hidden = true;
    resultContent.hidden = false;
    formError.textContent = error instanceof TypeError
      ? "Could not reach the prediction server. Start the FastAPI app and try again."
      : error.message || "Prediction failed. Check your listing details and try again.";
  } finally {
    predictButton.disabled = false;
    predictButton.querySelector(".button-label").textContent = "Predict room type";
  }
});
