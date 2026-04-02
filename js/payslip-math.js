/**
 * Pro-rate monthly fixed salary by payable days; split earnings like sample slip; PF on Basic; PT pro-rated.
 */
const EARNING_SPLITS = [
  { label: "Basic", ratio: 9800 / 25934.17 },
  { label: "HRA", ratio: 3900 / 25934.17 },
  { label: "Special Allowance", ratio: 7214.17 / 25934.17 },
  { label: "Travel Reimbursement (LTA)", ratio: 2500 / 25934.17 },
  { label: "Newspaper & Books Reimbursement", ratio: 500 / 25934.17 },
  { label: "Mobile & Internet Reimbursement", ratio: 2000 / 25934.17 },
];

const PF_RATE = 0.12;
const PF_MONTHLY_CAP = 1800;

function round2(n) {
  return Math.round(n * 100) / 100;
}

export function computePayslipPayload({ employee, monthYear, totalWorkingDays, lossOfPayDays }) {
  const twd = Math.max(Number(totalWorkingDays) || 0, 0.0001);
  const lop = Math.max(Number(lossOfPayDays) || 0, 0);
  const daysPayable = Math.max(twd - lop, 0);
  const ratio = Math.min(Math.max(daysPayable / twd, 0), 1);

  const fixedSalary = Number(employee.fixedSalary) || 0;
  const gross = round2(fixedSalary * ratio);

  const rawParts = EARNING_SPLITS.map((row) => ({
    label: row.label,
    amount: gross * row.ratio,
  }));
  const sumRaw = rawParts.reduce((a, r) => a + r.amount, 0);
  const drift = gross - sumRaw;
  if (rawParts.length) {
    rawParts[rawParts.length - 1].amount = round2(rawParts[rawParts.length - 1].amount + drift);
  }
  const earnings = rawParts.map((r) => ({ label: r.label, amount: round2(r.amount) }));

  const basic = earnings[0]?.amount || 0;

  // Remove PF logic and contributions
  const pt = gross >= 20000 ? round2(200 * ratio) : 0;

  const contributions = [];
  const deductions = pt > 0 ? [{ label: "Professional Tax", amount: pt }] : [];

  const totalEarnings = earnings.reduce((a, x) => a + x.amount, 0);
  const totalB = contributions.reduce((a, x) => a + x.amount, 0);
  const totalC = deductions.reduce((a, x) => a + x.amount, 0);
  const net = round2(totalEarnings - totalB - totalC);

  return {
    monthYear,
    company: {
      name: "PJN TECHNOLOGIES PVT LTD",
      address1: "Room No 2, 2nd floor opp to Tea Master Nehru Road, kullapa circle,",
      address2: "Ramaswamipalya, Kammanahalli, Bengaluru,",
      address3: "Karnataka 560084",
    },
    employee: {
      name: employee.name,
      employeeNumber: employee.employeeNumber || "—",
      dateJoined: formatDisplayDate(employee.dateJoined),
      department: employee.department || "—",
      subDepartment: employee.subDepartment || "N/A",
      designation: employee.designation || "—",
      paymentMode: employee.paymentMode === "Bank" ? "Bank Transfer" : employee.paymentMode || "—",
      uan: employee.uan || "—",
      pfNumber: employee.pfNumber || "—",
      pan: employee.pan || "—",
    },
    days: {
      actualPayableDays: round2(daysPayable),
      totalWorkingDays: round2(twd),
      lossOfPayDays: round2(lop),
      daysPayable: Math.round(daysPayable * 100) / 100,
    },
    earnings,
    contributions,
    deductions,
    totals: {
      earnings: totalEarnings,
      contributions: totalB,
      deductions: totalC,
      net,
    },
  };
}

function formatDisplayDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T12:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
