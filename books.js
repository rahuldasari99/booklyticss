window.addEventListener("DOMContentLoaded", () => {
  fetchbookData();  // default load

  const booknameele = document.getElementById("ubookname");
  const searchForm = document.getElementById("searchForm");
  let bookCount = document.getElementById("bookCount");

  // Filter dropdowns
  const categoryFilter = document.getElementById("categoryFilter");
  const ratingFilter = document.getElementById("ratingFilter");

  let allBooks = []; // store fetched books globally

  searchForm?.addEventListener("submit", (e) => {
    e.preventDefault(); // prevent page reload
    fetchbooksearch(booknameele.value);
  });

  // Filter change events
  categoryFilter?.addEventListener("change", applyFilters);
  ratingFilter?.addEventListener("change", applyFilters);

  function fetchbookData() {
    fetch("data.json")
      .then(res => res.json())
      .then(data => {
        allBooks = data.Sheet1; // store globally
        populateFilters(allBooks);
        renderTable(allBooks); // render table initially
      })
      .catch(err => console.error("Error loading data:", err));
  }

  function fetchbooksearch(searchTerm) {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      alert("Please enter student name or ID");
      return;
    }

    const filtered = allBooks.filter(student =>
      student.Book_Title.toLowerCase().includes(term) ||
      student.Category.toLowerCase().includes(term)
    );
   
    renderTable(filtered);
  }

  function populateFilters(books) {
    if (!categoryFilter || !ratingFilter) return;

    // Unique categories
    const categories = [...new Set(books.map(b => b.Category))].sort();
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      categoryFilter.appendChild(opt);
    });

    // Unique ratings
    const ratings = [...new Set(books.map(b => b.Rating))].sort((a,b)=>b-a);
    ratingFilter.innerHTML = '<option value="all">All Ratings</option>';
    ratings.forEach(r => {
      const opt = document.createElement("option");
      opt.value = r;
      opt.textContent = `⭐${r}`;
      ratingFilter.appendChild(opt);
    });
  }

  function applyFilters() {
    const category = categoryFilter?.value || "all";
    const rating = ratingFilter?.value || "all";

    const filtered = allBooks.filter(book => {
      const matchCategory = category === "all" || book.Category === category;
      const matchRating = rating === "all" || book.Rating == rating;
      return matchCategory && matchRating;
    });

    renderTable(filtered);
  }

  function renderTable(books) {
    const tbody = document.querySelector("#studentTable tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (books.length === 0) {
      tbody.innerHTML = `<tr><td colspan="11" class="text-center">No results found</td></tr>`;
      bookCount.textContent = "Total Books: 0";
      return;
    }

    books.forEach(student => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${student.Book_Title}</td>
        <td>${student.Category}</td>
        <td>⭐${student.Rating}</td>
      `;
      tbody.appendChild(row);
    });

    // Update book count
    // bookCount.textContent = `Total Books: ${books.length}`;
     const uniqueBooks = [...new Set(allBooks.map(s => s.Book_Title))];
        bookCount.textContent = `Total Books: ${uniqueBooks.length}`;
  }
});
