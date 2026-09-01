export function inr(amount) {
  if (amount === undefined || amount === null) return "0.00";
  return Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function numberToWordsIndian(num) {
  const a = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const b = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

  function twoDigits(n) {
    if (n < 20) return a[n];
    return `${b[Math.floor(n / 10)]}${n % 10 ? ` ${a[n % 10]}` : ""}`;
  }

  function threeDigits(n) {
    if (n === 0) return "";
    if (n < 100) return twoDigits(n);
    return `${a[Math.floor(n / 100)]} hundred${n % 100 ? ` ${twoDigits(n % 100)}` : ""}`;
  }

  if (num === 0) return "(Rupees zero only)";

  let n = Math.floor(num);
  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const rest = n;

  const parts = [];
  if (crore) parts.push(`${twoDigits(crore)} crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} thousand`);
  if (rest) parts.push(threeDigits(rest));

  return `(Rupees ${parts.join(" ")} only)`;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text || "—";
}

export function renderPayslip(p) {
  // Header - Always enforce PJN TECHNOLOGIES PVT LTD
  setText("companyName", "PJN TECHNOLOGIES PVT LTD");
  setText("companyAddress1", "Room No 2, 2nd floor opp to Tea Master Nehru Road, kullapa circle,");
  setText("companyAddress2", "Ramaswamipalya, Kammanahalli, Bengaluru,");
  setText("companyAddress3", "Karnataka 560084");
  setText("monthYear", p.monthYear);

  // Table 1: Employee Details
  const emp = p.employee || {};
  setText("empCode", emp.employeeNumber);
  setText("empName", emp.name);
  setText("dateJoined", emp.dateJoined);
  setText("designation", emp.designation);
  setText("department", emp.department);
  setText("location", emp.location || "BENGALURU");

  setText("payMode", emp.paymentMode || "BANK TRANSFER");
  setText("bankName", emp.bankName || "HDFC");
  setText("bankAcc", emp.bankAccountNo || "—");
  setText("pfNo", emp.pfNumber || "—");
  setText("panNo", emp.pan || "—");
  setText("uanNo", emp.uan || "—");

  // Table 2: Attendance Details
  const d = p.days || {};
  setText("stdDays", Number(d.standardDays || 31).toFixed(1));
  setText("wrkDays", Number(d.workedDays || 31).toFixed(1));
  setText("lopDays", Number(d.lopDays || 0).toFixed(1));
  setText("clDays", Number(d.clDays || 0).toFixed(1));
  setText("slDays", Number(d.slDays || 0).toFixed(1));
  setText("plDays", Number(d.plDays || 0).toFixed(1));

  // Table 3: Earnings & Deductions
  const earnings = p.earnings || [];
  const deductions = p.deductions || [];
  const maxRows = Math.max(earnings.length, deductions.length, 5);

  const tbody = document.getElementById("payTableBody");
  if (tbody) {
    let rowsHtml = "";
    for (let i = 0; i < maxRows; i++) {
      const earn = earnings[i];
      const ded = deductions[i];

      const earnName = earn ? earn.label : "";
      const earnFixed = earn ? inr(earn.fixedAmount) : "";
      const earnEarned = earn ? inr(earn.amount) : "";

      const dedName = ded ? ded.label : "";
      const dedAmt = ded ? inr(ded.amount) : "";

      rowsHtml += `
        <tr>
          <td class="item-col">${earnName}</td>
          <td class="num-col">${earnFixed}</td>
          <td class="num-col">${earnEarned}</td>
          <td class="item-col">${dedName}</td>
          <td class="num-col">${dedAmt}</td>
        </tr>
      `;
    }
    tbody.innerHTML = rowsHtml;
  }

  // Totals
  const totals = p.totals || {};
  setText("totFixed", totals.fixedEarnings ? inr(totals.fixedEarnings) : "");
  setText("totEarned", totals.earnedEarnings ? inr(totals.earnedEarnings) : inr(totals.earnings));
  setText("totDeductions", inr(totals.deductions || 0));

  // Net Pay & Words
  const net = totals.netPay !== undefined ? totals.netPay : totals.net;
  setText("netPay", inr(net));
  setText("netWords", numberToWordsIndian(net));
}
