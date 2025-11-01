// --- Access control: only admin can open this page ---

document.addEventListener("DOMContentLoaded", async () => {
 const adminData = localStorage.getItem("adminData");

  // If no admin is logged in, redirect to login page
  if (!adminData) {
    alert("Access denied! Admin login required.");
    window.location.href = "index.html"; // or your login page
    return;
  }

  const supabaseUrl = 'https://pgnkoowjfxtsbxddipxk.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbmtvb3dqZnh0c2J4ZGRpcHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NTQ0MzIsImV4cCI6MjA3NzEzMDQzMn0.RPIClQMK14sVlNhmXji8YVO1hGp4Cnt3lwqrW4ym7xA';
  const tableName = 'library_usage';

  // DOM elements
 
  const studentnameele = document.getElementById("ustudentname");
  const searchForm = document.getElementById("searchForm");
  const studentCount = document.getElementById("studentCount");
  const fineCount = document.getElementById("totalFine");

  const departmentFilter = document.getElementById("departmentFilter");
  const yearFilter = document.getElementById("yearFilter");
  const categoryFilter = document.getElementById("categoryFilter");
  const ratingFilter = document.getElementById("ratingFilter");
  const resetBtn = document.getElementById("resetFilters");

  let allStudents = [];

  // --- Fetch all rows from Supabase (beyond 1000 limit) ---
  async function fetchAllRowsParallel() {
  const limit = 1000;
  const totalEstimate = 10000; // estimate your total rows
  const batchCount = Math.ceil(totalEstimate / limit);
  
  const requests = Array.from({ length: batchCount }, (_, i) =>
    fetch(`${supabaseUrl}/rest/v1/${tableName}?select=*`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Range: `${i * limit}-${(i + 1) * limit - 1}`,
      },
    }).then(res => res.ok ? res.json() : [])
  );

  const results = await Promise.all(requests);
  return results.flat();
}

  // --- Main fetch function ---
  async function fetchStudentData() {
    try {
       
      const data = await fetchAllRowsParallel();
    
      allStudents = data;
      populateFilters(allStudents);
      renderTable(allStudents);
      console.log(`✅ Loaded ${allStudents.length} records.`);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  }
  // async function init() {
  //   try {
  //     loader.innerText = "Fetching data from Supabase...";
  //     const data = await fetchAllRows();
  //     loader.style.display = "none";
  //     console.log(`✅ Loaded ${data.length} records.`);
  //     createCharts(data);
  //   } catch (err) {
  //     loader.innerText = "❌ Failed to load data.";
  //     console.error(err);
  //   }
  // }

  // Populate dropdown filters dynamically
  function populateFilters(students) {
    const setOptions = (filter, options, defaultLabel) => {
      filter.innerHTML = `<option value="all">${defaultLabel}</option>`;
      [...options].sort().forEach((opt) => {
        const el = document.createElement("option");
        el.value = opt;
        el.textContent = opt;
        filter.appendChild(el);
      });
    };

    setOptions(
      departmentFilter,
      new Set(students.map((s) => s.Department)),
      "All Departments"
    );
    setOptions(
      yearFilter,
      new Set(students.map((s) => s.Year)),
      "All Years"
    );
    setOptions(
      categoryFilter,
      new Set(students.map((s) => s.Category)),
      "All Categories"
    );
    setOptions(
      ratingFilter,
      new Set(students.map((s) => s.Rating)),
      "All Ratings"
    );
  }

  // Filter logic
  function applyFilters() {
    const dep = departmentFilter.value;
    const year = yearFilter.value;
    const cat = categoryFilter.value;
    const rate = ratingFilter.value;

    const filtered = allStudents.filter((s) => {
      const matchDep = dep === "all" || s.Department === dep;
      const matchYear = year === "all" || s.Year === year;
      const matchCat = cat === "all" || s.Category === cat;
      const matchRate = rate === "all" || s.Rating == rate;
      return matchDep && matchYear && matchCat && matchRate;
    });

    renderTable(filtered);
  }

  // Search logic
  function fetchstudentsearch(term) {
    term = term.trim().toLowerCase();
    if (!term) return renderTable(allStudents);

    const filtered = allStudents.filter(
      (s) =>
        s.Student_Name.toLowerCase().includes(term) ||
        s.Student_ID.toString().toLowerCase().includes(term) ||
        s.Department.toLowerCase().includes(term)
    );

    renderTable(filtered);
  }

  // Render data in table
  function renderTable(students) {
    const tbody = document.querySelector("#studentTable tbody");
    tbody.innerHTML = "";

    if (!students.length) {
      tbody.innerHTML =
        '<tr><td colspan="11" class="text-center">No results found</td></tr>';
      studentCount.textContent = "Total Students: 0";
      fineCount.textContent = "Total Fine: ₹0";
      return;
    }

    students.forEach((s) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${s.Student_ID}</td>
        <td>${s.Student_Name}</td>
        <td>${s.Department}</td>
        <td>${s.Year}</td>
        <td>${s.Book_Title}</td>
        <td>${s.Category}</td>
        <td>${s.Borrow_Date}</td>
        <td>${s.Return_Date}</td>
        <td>${s.Days_Borrowed}</td>
        <td>₹${s.Fine_Amount}</td>
        <td>⭐${s.Rating}</td>
      `;
      tbody.appendChild(row);
    });

    studentCount.textContent = `Total Students: ${students.length}`;
    const totalFine = students.reduce(
      (sum, s) => sum + (parseFloat(s.Fine_Amount) || 0),
      0
    );
    fineCount.textContent = `Total Fine: ₹${totalFine.toFixed(2)}`;
  }

  // Reset filters
  resetBtn.addEventListener("click", () => {
    departmentFilter.value = "all";
    yearFilter.value = "all";
    categoryFilter.value = "all";
    ratingFilter.value = "all";
    studentnameele.value = "";
    renderTable(allStudents);
  });

  // Event listeners
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    fetchstudentsearch(studentnameele.value);
  });

  departmentFilter.addEventListener("change", applyFilters);
  yearFilter.addEventListener("change", applyFilters);
  categoryFilter.addEventListener("change", applyFilters);
  ratingFilter.addEventListener("change", applyFilters);

  // Initial load
  fetchStudentData();
});

// Logout
function logout() {
  localStorage.removeItem('adminData');
  window.location.href = 'index.html';
}
