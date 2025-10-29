document.addEventListener("DOMContentLoaded", async () => {
    const supabaseUrl = 'https://pgnkoowjfxtsbxddipxk.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbmtvb3dqZnh0c2J4ZGRpcHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NTQ0MzIsImV4cCI6MjA3NzEzMDQzMn0.RPIClQMK14sVlNhmXji8YVO1hGp4Cnt3lwqrW4ym7xA';
    const tableName = 'library_usage';

    const loader = document.getElementById("loader");
     const insightList = document.getElementById("insightList");

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
        const res = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=Student_ID,Department,Category,Year,Fine_Amount,Days_Borrowed`, {
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

    // --- Main function ---
    async function init() {
      try {
        loader.innerText = "Fetching data from Supabase...";
        const data = await fetchAllRows();
        loader.style.display = "none";
        console.log(`✅ Loaded ${data.length} records.`);
        createCharts(data);
      } catch (err) {
        loader.innerText = "❌ Failed to load data.";
        console.error(err);
      }
    }

    // --- Chart Function ---
    function createCharts(data) {
      // 1️⃣ Average Fine by Department
      const fineByDept = {};
      data.forEach(item => {
        const dept = item.Department;
        const fine = parseFloat(item.Fine_Amount);
        if (!fineByDept[dept]) fineByDept[dept] = [];
        fineByDept[dept].push(fine);
      });

      const avgFineDept = {};
      for (let dept in fineByDept) {
        const arr = fineByDept[dept];
        avgFineDept[dept] = arr.reduce((a,b)=>a+b,0) / arr.length;
      }

      new Chart(document.getElementById('avgFineChart'), {
        type: 'bar',
        data: {
          labels: Object.keys(avgFineDept),
          datasets: [{
            label: 'Average Fine (₹)',
            data: Object.values(avgFineDept).map(v => v.toFixed(2)),
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderColor: '#64ffda',
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
        const cat = item.Category;
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
        const year = item.Year;
        const days = parseFloat(item.Days_Borrowed);
        if (!daysByYear[year]) daysByYear[year] = [];
        daysByYear[year].push(days);
      });

      const avgDaysByYear = {};
      for (let yr in daysByYear) {
        const arr = daysByYear[yr];
        avgDaysByYear[yr] = arr.reduce((a,b)=>a+b,0) / arr.length;
      }

      new Chart(document.getElementById('daysLineChart'), {
        type: 'line',
        data: {
          labels: Object.keys(avgDaysByYear),
          datasets: [{
            label: 'Average Days Borrowed',
            data: Object.values(avgDaysByYear).map(v => v.toFixed(2)),
            fill: false,
            borderColor: '#64ffda',
            tension: 0.3
          }]
        },
      });

      // 4️⃣ Total Fine by Dept + Category
      const fineData = {};
      data.forEach(item => {
        const key = item.Department + " - " + item.Category;
        const fine = parseFloat(item.Fine_Amount);
        fineData[key] = (fineData[key] || 0) + fine;
      });

      new Chart(document.getElementById('fineBarChart'), {
        type: 'bar',
        data: {
          labels: Object.keys(fineData),
          datasets: [{
            label: 'Total Fine (₹)',
            data: Object.values(fineData),
            backgroundColor: '#64ffda'
          }]
        },
      });

      // 5️⃣ Donut Chart - Count by Department
      const deptCount = {};
      data.forEach(item => {
        deptCount[item.Department] = (deptCount[item.Department] || 0) + 1;
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

      // 6️⃣ Category vs Days Borrowed (Clustered Bar)
      const ranges = { "0-10": {}, "11-20": {}, "21-30": {} };

      data.forEach(item => {
        const days = parseInt(item.Days_Borrowed);
        const cat = item.Category;
        let range = "";
        if (days <= 10) range = "0-10";
        else if (days <= 20) range = "11-20";
        else range = "21-30";
        ranges[range][cat] = (ranges[range][cat] || 0) + 1;
      });

      const categories = [...new Set(data.map(d => d.Category))];
      const rangeLabels = Object.keys(ranges);
      const datasets = rangeLabels.map(range => ({
        label: range,
        data: categories.map(cat => ranges[range][cat] || 0),
        backgroundColor:
          range === "0-10" ? "#e7f5f1" :
          range === "11-20" ? "#ff6f61" : "#ffa600"
      }));

      new Chart(document.getElementById('categoryDaysCluster'), {
        type: 'bar',
        data: { labels: categories, datasets: datasets },
      });
    }
   

    // 🚀 Run
    init();
  });
  