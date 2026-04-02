const STORAGE_KEY = "salary-slip-employees-v1";

/**
 * Merge JSON file employees with localStorage (local wins by id; new from file if missing).
 */
async function loadEmployeesFromJson() {
  try {
    const res = await fetch("data/employees.json", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.employees) ? data.employees : [];
  } catch {
    return [];
  }
}

function loadStoredOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredOverrides(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function mergeEmployees(fileList, storedList) {
  const byId = new Map();
  fileList.forEach((e) => {
    if (e && e.id) byId.set(e.id, { ...e });
  });
  storedList.forEach((e) => {
    if (e && e.id) byId.set(e.id, { ...byId.get(e.id), ...e });
  });
  return Array.from(byId.values());
}

export async function getAllEmployees() {
  const file = await loadEmployeesFromJson();
  const stored = loadStoredOverrides();
  return mergeEmployees(file, stored);
}

export async function addEmployee(employee) {
  const list = loadStoredOverrides();
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `emp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const next = {
    id,
    name: String(employee.name || "").trim(),
    dateJoined: employee.dateJoined || "",
    department: String(employee.department || "").trim(),
    subDepartment: String(employee.subDepartment || "").trim() || "N/A",
    designation: String(employee.designation || "").trim(),
    paymentMode: String(employee.paymentMode || "Bank").trim() || "Bank",
    pan: String(employee.pan || "").trim().toUpperCase(),
    fixedSalary: Number(employee.fixedSalary) || 0,
    employeeNumber: String(employee.employeeNumber || "").trim() || `XF-${id.slice(0, 8).toUpperCase()}`,
    uan: String(employee.uan || "").trim(),
    pfNumber: String(employee.pfNumber || "").trim(),
  };
  list.push(next);
  saveStoredOverrides(list);
  return next;
}

export function findEmployeesByNameQuery(employees, query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return [];
  return employees.filter((e) => (e.name || "").toLowerCase().includes(q));
}

export function findEmployeeByNameExact(employees, name) {
  const t = String(name || "").trim().toLowerCase();
  return employees.find((e) => (e.name || "").toLowerCase() === t) || null;
}
