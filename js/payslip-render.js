export function inr(amount) {
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function numberToWordsIndian(num) {
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function twoDigits(n) {
    if (n < 20) return a[n];
    return `${b[Math.floor(n / 10)]}${n % 10 ? ` ${a[n % 10]}` : ""}`;
  }

  function threeDigits(n) {
    if (n === 0) return "";
    if (n < 100) return twoDigits(n);
    return `${a[Math.floor(n / 100)]} Hundred${n % 100 ? ` ${twoDigits(n % 100)}` : ""}`;
  }

  if (num === 0) return "Zero Rupees only";

  let n = Math.floor(num);
  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const rest = n;

  const parts = [];
  if (crore) parts.push(`${twoDigits(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (rest) parts.push(threeDigits(rest));

  return `${parts.join(" ")} Rupees only`;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function renderRows(containerId, rows) {
  const target = document.getElementById(containerId);
  if (!target) return;
  target.innerHTML = rows
    .map(
      (item) => `
      <div class="row">
        <span>${item.label}</span>
        <strong>${inr(item.amount)}</strong>
      </div>
    `
    )
    .join("");
}

function renderInfoGrid(employee) {
  const grid = document.getElementById("employeeInfoGrid");
  if (!grid) return;
  const fields = [
    ["Employee Number", employee.employeeNumber],
    ["Date Joined", employee.dateJoined],
    ["Department", employee.department],
    ["Sub Department", employee.subDepartment],
    ["Designation", employee.designation],
    ["Payment Mode", employee.paymentMode],
    ["UAN", employee.uan],
    ["PF Number", employee.pfNumber],
    ["PAN", employee.pan],
  ];

  grid.innerHTML = fields
    .map(
      ([label, value]) => `
      <div class="info-item">
        <span class="label">${label}</span>
        <span class="value small-v">${value}</span>
      </div>
    `
    )
    .join("");
}

function renderDaysGrid(days) {
  const grid = document.getElementById("daysGrid");
  if (!grid) return;
  const fields = [
    ["Actual Payable Days", days.actualPayableDays],
    ["Total Working Days", days.totalWorkingDays],
    ["Loss Of Pay Days", days.lossOfPayDays],
    ["Days Payable", days.daysPayable],
  ];

  grid.innerHTML = fields
    .map(
      ([label, value]) => `
      <div class="days-item">
        <span class="label">${label}</span>
        <span class="value"><strong>${Number(value).toFixed(2)}</strong></span>
      </div>
    `
    )
    .join("");
}

export function renderPayslip(payslipData) {
  setText("monthYear", payslipData.monthYear);
  setText("companyName", payslipData.company.name);
  setText("companyAddress1", payslipData.company.address1);
  setText("companyAddress2", payslipData.company.address2);
  setText("companyAddress3", payslipData.company.address3);
  setText("employeeName", payslipData.employee.name);

  renderInfoGrid(payslipData.employee);
  renderDaysGrid(payslipData.days);
  renderRows("earningsList", payslipData.earnings);
  renderRows("deductionList", payslipData.deductions);

  const earningsTotal = payslipData.earnings.reduce((acc, item) => acc + item.amount, 0);
  const deductionTotal = payslipData.deductions.reduce((acc, item) => acc + item.amount, 0);
  const netPay = earningsTotal - deductionTotal;

  setText("earningsTotal", inr(earningsTotal));
  setText("deductionTotal", inr(deductionTotal));
  setText("netPay", inr(netPay));
  setText("netWords", numberToWordsIndian(netPay));
}
