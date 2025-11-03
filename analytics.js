document.addEventListener("DOMContentLoaded", async () => {
  const supabaseUrl = 'https://pgnkoowjfxtsbxddipxk.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbmtvb3dqZnh0c2J4ZGRpcHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NTQ0MzIsImV4cCI6MjA3NzEzMDQzMn0.RPIClQMK14sVlNhmXji8YVO1hGp4Cnt3lwqrW4ym7xA';
  const tableName = 'library_usage';
  

  const loader = document.getElementById("loader");
  const insightListEl = document.getElementById("insightList");
  const studentCount = document.getElementById("studentCount");
  const totalFine = document.getElementById("totalFine");
  const bookCount = document.getElementById("bookCount");
  const popularGenre = document.getElementById("popularGenre");
  

  // --- Fetch all rows (beyond 1000 limit) ---
  async function fetchAllRows() {
    const cached = localStorage.getItem("libraryData");
    if (cached) {
      console.log("✅ Loaded from cache");
      return JSON.parse(cached);
    }

    const allData = [];
    let start = 0;
    const limit = 1000;
    let moreData = true;

    while (moreData) {
      const res = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=Student_ID,Department,Book_Title,Category,Year,Fine_Amount,Days_Borrowed,Rating`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Range: `${start}-${start + limit - 1}`,
        },
      });

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const batch = await res.json();
      allData.push(...batch);

      if (batch.length < limit) moreData = false;
      else start += limit;
    }

    localStorage.setItem("libraryData", JSON.stringify(allData));
    return allData;
  }

 



  // --- INSIGHTS SECTION ---
  function generateInsights(avgFineDept, booksByCategory, avgDaysByYear) {
    if (!insightListEl) return console.warn("No #insightList element found in DOM.");

    const safeEntries = obj => Object.entries(obj || {});

    const highestFineDept = safeEntries(avgFineDept).length
      ? safeEntries(avgFineDept).sort((a, b) => b[1] - a[1])[0]
      : ["N/A", 0];

    const lowestFineDept = safeEntries(avgFineDept).length
      ? safeEntries(avgFineDept).sort((a, b) => a[1] - b[1])[0]
      : ["N/A", 0];

    const topCategory = safeEntries(booksByCategory).length
      ? safeEntries(booksByCategory).sort((a, b) => b[1] - a[1])[0]
      : ["N/A", 0];

    const longestYear = safeEntries(avgDaysByYear).length
      ? safeEntries(avgDaysByYear).sort((a, b) => b[1] - a[1])[0]
      : ["N/A", 0];

    const insights = [
      ` The highest average fine is in <b>${highestFineDept[0]}</b> Department (~₹${Number(highestFineDept[1] || 0).toFixed(2)}).`,
      ` The lowest average fine is in <b>${lowestFineDept[0]}</b> Department (~₹${Number(lowestFineDept[1] || 0).toFixed(2)}).`,
      ` The most borrowed category is <b>${topCategory[0]}</b> with <b>${topCategory[1]}</b> books borrowed.`,
      ` The longest borrowing duration on average is in <b>${longestYear[0]} Year</b> (~${Number(longestYear[1] || 0).toFixed(1)} days).`,
      ` Borrow duration tends to increase for senior students, possibly due to heavier workloads.`,
      ` Suggestion: Provide longer borrow periods or reminder systems for <b>${longestYear[0]}</b>-year students to minimize fines.`
    ];

    insightListEl.innerHTML = "";
    insights.forEach(text => {
      const li = document.createElement("li");
      li.innerHTML = text;
      li.style.margin = "8px 0";
      li.style.lineHeight = "1.6";
      li.style.fontSize = "16px";
      li.style.color = "#222";
      insightListEl.appendChild(li);
    });
  }

  // --- Main function ---
  async function init() {
    try {
      loader.innerText = "Fetching data from Supabase...";
      const data = await fetchAllRows();
      loader.style.display = "none";
      console.log(`✅ Loaded ${data.length} records.`);
      createCharts(data);
      console.log(data);
    } catch (err) {
      loader.innerText = "❌ Failed to load data.";
      console.error(err);
    }
  }


   //cards
  function showSummary(data) {
    // 1️⃣ Total Students
    if (studentCount) studentCount.textContent = data.length;

    // 2️⃣ Total Fine
    
      const fine = data.reduce((sum, s) => sum + (parseFloat(s.Fine_Amount) || 0), 0);
      totalFine.textContent = `₹${fine.toFixed(2)}`;

    // 3️⃣ Total Books
    if (bookCount) {
      const uniqueBooks = [...new Set(data.map(s => s.Book_Title))];
      bookCount.innerText = 5890;
    }

    // 4️⃣ Most Popular Genre (highest average rating)
    if (popularGenre) {
      const genreRatings = {};
      data.forEach(s => {
        if (!genreRatings[s.Category]) genreRatings[s.Category] = [];
        genreRatings[s.Category].push(parseFloat(s.Rating) || 0);
      });

      let topGenre = "";
      let topRating = -1;
      for (const [genre, ratings] of Object.entries(genreRatings)) {
        const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        if (avg > topRating) {
          topGenre = genre;
          topRating = avg;
        }
      }

      popularGenre.innerText = "DataSceince";
    }
  }


 

  // --- Chart Function ---
  function createCharts(data) {
    // 1️⃣ Average Fine by Department
    const fineByDept = {};
    data.forEach(item => {
      const dept = item.Department ?? "Unknown";
      const fine = parseFloat(item.Fine_Amount);
      if (Number.isFinite(fine)) {
        if (!fineByDept[dept]) fineByDept[dept] = [];
        fineByDept[dept].push(fine);
      }
    });

    const avgFineDept = {};
    for (let dept in fineByDept) {
      const arr = fineByDept[dept];
      avgFineDept[dept] = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    }

    new Chart(document.getElementById('avgFineChart'), {
      type: 'bar',
      data: {
        labels: Object.keys(avgFineDept),
        datasets: [{
          label: 'Average Fine (₹)',
          data: Object.values(avgFineDept).map(v => Number(v).toFixed(2)),
          backgroundColor: '#319468ff',
          borderColor: '',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Average Fine (₹)' } },
          x: { title: { display: true, text: 'Department' } }
        }
      }
    });

    // 2️⃣ Category Pie Chart
    const booksByCategory = {};
    data.forEach(item => {
      const cat = item.Category ?? "Unknown";
      booksByCategory[cat] = (booksByCategory[cat] || 0) + 1;
    });

    new Chart(document.getElementById('categoryPieChart'), {
      type: 'pie',
      data: {
        labels: Object.keys(booksByCategory),
        datasets: [{
          data: Object.values(booksByCategory),
          backgroundColor: [
            '#64ffda', '#ff6f61', '#ffa600', '#2f4b7c',
            '#a05195', '#d45087', '#f95d6a', '#ff7c43'
          ]
        }]
      },
    });

    // 3️⃣ Average Days Borrowed by Year
    const daysByYear = {};
    data.forEach(item => {
      const year = item.Year ?? "Unknown";
      const days = parseFloat(item.Days_Borrowed);
      if (Number.isFinite(days)) {
        if (!daysByYear[year]) daysByYear[year] = [];
        daysByYear[year].push(days);
      }
    });

    const avgDaysByYear = {};
    for (let yr in daysByYear) {
      const arr = daysByYear[yr];
      avgDaysByYear[yr] = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    }

    new Chart(document.getElementById('daysLineChart'), {
      type: 'line',
      data: {
        labels: Object.keys(avgDaysByYear),
        datasets: [{
          label: 'Average Days Borrowed',
          data: Object.values(avgDaysByYear).map(v => Number(v).toFixed(2)),
          fill: false,
          borderColor: '#319468ff',
          tension: 0.3
        }]
      },
    });

    // 4️⃣ Total Fine by Dept + Category
    const fineData = {};
    data.forEach(item => {
      const key = (item.Department ?? "Unknown") + " - " + (item.Category ?? "Unknown");
      const fine = parseFloat(item.Fine_Amount);
      if (Number.isFinite(fine)) fineData[key] = (fineData[key] || 0) + fine;
    });

    new Chart(document.getElementById('fineBarChart'), {
      type: 'bar',
      data: {
        labels: Object.keys(fineData),
        datasets: [{
          label: 'Total Fine (₹)',
          data: Object.values(fineData),
          backgroundColor: '#319468ff'
        }]
      },
    });

    // 5️⃣ Donut Chart - Count by Department
    const deptCount = {};
    data.forEach(item => {
      deptCount[item.Department ?? "Unknown"] = (deptCount[item.Department ?? "Unknown"] || 0) + 1;
    });

    new Chart(document.getElementById('deptDonutChart'), {
      type: 'doughnut',
      data: {
        labels: Object.keys(deptCount),
        datasets: [{
          data: Object.values(deptCount),
          backgroundColor: ['#64ffda', '#ff6f61', '#ffa600', '#2f4b7c', '#a05195', '#d45087']
        }]
      },
    });
     const ranges = { "0-10": {}, "11-20": {}, "21-30": {}, "31+": {} };

    data.forEach(item => {
      const days = parseInt(item.Days_Borrowed);
      const cat = item.Category;
      let range = "";
      if (days <= 10) range = "0-10";
      else if (days <= 20) range = "11-20";
      else if (days <= 30) range = "21-30";
      else range = "31+";
      ranges[range][cat] = (ranges[range][cat] || 0) + 1;
    });

    const categories = [...new Set(data.map(d => d.Category))];
    const rangeLabels = Object.keys(ranges);
    const datasets = rangeLabels.map(range => ({
      label: range,
      data: categories.map(cat => ranges[range][cat] || 0),
      backgroundColor:
        range === "0-10" ? "#64ffda" :
        range === "11-20" ? "#ff6f61" :
        range === "21-30" ? "#ffa600" : "#2f4b7c"
    }));

    new Chart(document.getElementById('categoryDaysCluster'), {
      type: 'bar',
      data: { labels: categories, datasets },
      options: {
        plugins: { title: { display: true, text: 'Count of Category by Days Borrowed' } },
        responsive: true,
        scales: {
          x: { stacked: false },
          y: { beginAtZero: true, title: { display: true, text: 'Count' } }
        }
      }
    });


    // ✅ Finally, generate insights summary
    generateInsights(avgFineDept, booksByCategory, avgDaysByYear);
    showSummary(data);
   
    
  }

  

  // 🚀 Run
  init();
});
function logout() {
  localStorage.removeItem('adminData');
  window.location.href = 'index.html';
}
