import {
  getAllEmployees,
  findEmployeeByNameExact,
  findEmployeesByNameQuery,
} from "./js/storage.js";
import { computePayslipPayload } from "./js/payslip-math.js";

const PREVIEW_KEY = "payslipPreview";

const monthSelect = document.getElementById("month");
const yearInput = document.getElementById("year");
const nameInput = document.getElementById("empName");
const nameList = document.getElementById("nameList");
const btnPreview = document.getElementById("btnPreview");
const genMessage = document.getElementById("genMessage");

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

function fillMonths() {
  monthSelect.innerHTML = MONTHS.map((m, i) => `<option value="${i}">${m}</option>`).join("");
}

function initDefaults() {
  const now = new Date();
  yearInput.value = now.getFullYear();
  monthSelect.value = String(now.getMonth());
}

async function refreshNameList() {
  const employees = await getAllEmployees();
  const names = [...new Set(employees.map((e) => e.name).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
  nameList.innerHTML = names.map((n) => `<option value="${escapeAttr(n)}"></option>`).join("");
}

function escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function monthYearLabel() {
  const mi = Number(monthSelect.value);
  const y = Number(yearInput.value);
  if (Number.isNaN(mi) || Number.isNaN(y)) return "";
  return `${MONTHS[mi]} ${y}`;
}

btnPreview.addEventListener("click", async () => {
  genMessage.hidden = true;
  const form = document.getElementById("genForm");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const fd = new FormData(form);
  const name = String(fd.get("empName") || "").trim();
  const employees = await getAllEmployees();
  let employee = findEmployeeByNameExact(employees, name);
  if (!employee) {
    const partial = findEmployeesByNameQuery(employees, name);
    if (partial.length === 1) employee = partial[0];
    else if (partial.length > 1) {
      genMessage.textContent =
        "Multiple employees match. Type the full name exactly as saved, or pick from the suggestions.";
      genMessage.hidden = false;
      return;
    }
  }

  if (!employee) {
    genMessage.textContent =
      "No employee found. Add them on Add employee, or check spelling (JSON file requires a local server).";
    genMessage.hidden = false;
    return;
  }

  const payload = computePayslipPayload({
    employee,
    monthYear: monthYearLabel(),
    totalWorkingDays: fd.get("totalWorkingDays"),
    lossOfPayDays: fd.get("lossOfPayDays"),
  });

  sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(payload));
  window.location.href = "payslip-view.html";
});

fillMonths();
initDefaults();
refreshNameList();
