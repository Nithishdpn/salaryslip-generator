import { renderPayslip } from "./js/payslip-render.js";

const PREVIEW_KEY = "payslipPreview";

const raw = sessionStorage.getItem(PREVIEW_KEY);
if (!raw) {
  document.querySelector(".page").innerHTML =
    '<div class="card"><p>No payslip data. Use <a href="generate-payslip.html">Generate payslip</a> and click View.</p></div>';
} else {
  try {
    const data = JSON.parse(raw);
    renderPayslip(data);
  } catch {
    document.querySelector(".page").innerHTML =
      '<div class="card"><p>Invalid payslip data. Go back to <a href="generate-payslip.html">Generate payslip</a>.</p></div>';
  }
}

document.getElementById("btnPrint")?.addEventListener("click", () => {
  window.print();
});
