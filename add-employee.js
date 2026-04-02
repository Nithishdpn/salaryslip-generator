import { addEmployee } from "./js/storage.js";

const form = document.getElementById("employeeForm");
const msg = document.getElementById("formMessage");

const panInput = form.querySelector('[name="pan"]');
panInput?.addEventListener("input", () => {
  panInput.value = panInput.value.toUpperCase();
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.hidden = true;

  const fd = new FormData(form);
  const pan = String(fd.get("pan") || "")
    .trim()
    .toUpperCase();

  try {
    const saved = await addEmployee({
      name: fd.get("name"),
      dateJoined: fd.get("dateJoined"),
      department: fd.get("department"),
      subDepartment: fd.get("subDepartment"),
      designation: fd.get("designation"),
      paymentMode: fd.get("paymentMode") || "Bank",
      pan,
      fixedSalary: fd.get("fixedSalary"),
      employeeNumber: fd.get("employeeNumber"),
      uan: fd.get("uan"),
      pfNumber: fd.get("pfNumber"),
    });
    msg.textContent = `Saved: ${saved.name} (${saved.id}). You can generate a payslip now.`;
    msg.hidden = false;
    form.reset();
    const pm = form.querySelector('[name="paymentMode"]');
    if (pm) pm.value = "Bank";
  } catch (err) {
    msg.textContent = err.message || "Could not save.";
    msg.hidden = false;
  }
});
