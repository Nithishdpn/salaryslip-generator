function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function computePayslipPayload({
  employee,
  monthYear,
  totalWorkingDays,
  lossOfPayDays,
  clDays = 0,
  slDays = 0,
  plDays = 0,
  includePF = false,
  includePT = false,
}) {
  const twd = Math.max(Number(totalWorkingDays) || 0, 0.0001);
  const lop = Math.max(Number(lossOfPayDays) || 0, 0);
  const daysWorked = Math.max(twd - lop, 0);
  const ratio = Math.min(Math.max(daysWorked / twd, 0), 1);

  const fixedSalary = round2(Number(employee.fixedSalary) || 0);

  // Calculate Fixed Earnings Components
  let fixedBasic = round2(fixedSalary * 0.30);
  let fixedHra = round2(fixedBasic * 0.50);
  let fixedChildEdu = fixedSalary >= 10000 ? 200 : 0;
  let fixedLta = round2(fixedSalary * 0.025);
  let fixedOther = Math.max(0, round2(fixedSalary - (fixedBasic + fixedHra + fixedChildEdu + fixedLta)));

  // If fixedOther is 0 due to low salary, balance with Basic/HRA
  if (fixedSalary < 10000) {
    fixedBasic = round2(fixedSalary * 0.50);
    fixedHra = round2(fixedSalary * 0.30);
    fixedChildEdu = 0;
    fixedLta = 0;
    fixedOther = Math.max(0, round2(fixedSalary - (fixedBasic + fixedHra)));
  }

  // Earned Earnings Components pro-rated by worked days ratio
  const earnedBasic = round2(fixedBasic * ratio);
  const earnedHra = round2(fixedHra * ratio);
  const earnedChildEdu = round2(fixedChildEdu * ratio);
  const earnedLta = round2(fixedLta * ratio);
  const earnedOther = round2(fixedOther * ratio);

  const earnings = [
    { label: "BASIC", fixedAmount: fixedBasic, amount: earnedBasic },
    { label: "HRA", fixedAmount: fixedHra, amount: earnedHra },
    { label: "CHILDREN EDUCATION ALLOWANCE", fixedAmount: fixedChildEdu, amount: earnedChildEdu },
    { label: "LTA", fixedAmount: fixedLta, amount: earnedLta },
    { label: "OTHER ALLOWANCE", fixedAmount: fixedOther, amount: earnedOther },
  ];

  const totalFixedEarnings = round2(fixedBasic + fixedHra + fixedChildEdu + fixedLta + fixedOther);
  const totalEarnedEarnings = round2(earnedBasic + earnedHra + earnedChildEdu + earnedLta + earnedOther);

  // Deductions: PF (>15,000) & PT (>20,000)
  const deductions = [];
  
  // PF rule: Applicable only for fixed salary > 15,000 (Flat ₹1,800)
  const isPFEligible = fixedSalary > 15000;
  if (includePF && isPFEligible) {
    deductions.push({ label: "PROVIDENT FUND", amount: 1800.00 });
  }

  // PT rule: Applicable only for fixed salary > 20,000
  const isPTEligible = fixedSalary > 20000;
  if (includePT && isPTEligible) {
    deductions.push({ label: "PROFESSIONAL TAX", amount: 200.00 });
  }

  const totalDeductions = round2(deductions.reduce((sum, item) => sum + item.amount, 0));
  const netPay = round2(totalEarnedEarnings - totalDeductions);

  return {
    monthYear,
    company: {
      name: "PJN TECHNOLOGIES PVT LTD",
      address1: "Room No 2, 2nd floor opp to Tea Master Nehru Road, kullapa circle,",
      address2: "Ramaswamipalya, Kammanahalli, Bengaluru,",
      address3: "Karnataka 560084",
    },
    employee: {
      name: employee.name || "—",
      employeeNumber: employee.employeeNumber || "—",
      dateJoined: formatDisplayDate(employee.dateJoined),
      designation: employee.designation || "—",
      department: employee.department || "—",
      location: employee.location || "BENGALURU",
      paymentMode: employee.paymentMode || "BANK TRANSFER",
      bankName: employee.bankName || "HDFC",
      bankAccountNo: employee.bankAccountNo || "—",
      pfNumber: employee.pfNumber || "—",
      pan: employee.pan || "—",
      uan: employee.uan || "—",
      fixedSalary,
      isPFEligible,
      isPTEligible,
    },
    days: {
      standardDays: round2(twd),
      workedDays: round2(daysWorked),
      lopDays: round2(lop),
      clDays: round2(Number(clDays) || 0),
      slDays: round2(Number(slDays) || 0),
      plDays: round2(Number(plDays) || 0),
    },
    earnings,
    deductions,
    totals: {
      fixedEarnings: totalFixedEarnings,
      earnedEarnings: totalEarnedEarnings,
      deductions: totalDeductions,
      netPay,
    },
  };
}

function formatDisplayDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T12:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
