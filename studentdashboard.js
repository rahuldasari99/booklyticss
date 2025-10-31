
// --- Access control: only student can open this page ---
document.addEventListener("DOMContentLoaded", () => {
  const studentData = localStorage.getItem("studentData");

  // If no student is logged in, redirect to login page
  if (!studentData) {
    alert("Access denied! Student login required.");
    window.location.href = "index.html"; // or your login page
    return;
  }
});



const supabaseUrl = 'https://pgnkoowjfxtsbxddipxk.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbmtvb3dqZnh0c2J4ZGRpcHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NTQ0MzIsImV4cCI6MjA3NzEzMDQzMn0.RPIClQMK14sVlNhmXji8YVO1hGp4Cnt3lwqrW4ym7xA'
    const tableName = 'library_usage'

    // Read student data
    const studentData = JSON.parse(localStorage.getItem('studentData'))
    const infoDiv = document.getElementById('studentInfo')
    const payBtn = document.getElementById('payFineBtn')
    const paymentStatus = document.getElementById('paymentStatus')

    function displayStudent() {
      if (!studentData) {
        infoDiv.innerHTML = '<p>No student data found. Please login again.</p>'
        payBtn.style.display = 'none'
      } else {
        infoDiv.innerHTML = `
          <p><strong>Student Name:</strong> ${studentData.Student_Name}</p>
          <p><strong>Student ID:</strong> ${studentData.Student_ID}</p>
          <p><strong>Department:</strong> ${studentData.Department}</p>
          <p><strong>Year:</strong> ${studentData.Year}</p>
          <table class="table table-striped table-bordered">
         <tr><th>Book ID</th><td>${studentData.Book_ID}</td></tr>
          <tr><th>Book Title</th><td>${studentData.Book_Title}</td></tr>
          <tr><th>Book Category</th><td>${studentData.Category}</td></tr>
          <tr><th>Borrow Date</th><td>${studentData.Borrow_Date}</td></tr>
          <tr><th>Return Date</th><td>${studentData.Return_Date}</td></tr>
          <tr><th>Book Rating</th><td>${studentData.Rating}</td></tr>
          <tr><th>Fine Amount</th><td>₹${studentData.Fine_Amount}</td></tr>
        </table>
        `
        payBtn.style.display = studentData.Fine_Amount > 0 ? 'inline-block' : 'none'
      }
    }

    displayStudent()

    // Razorpay payment
    payBtn.addEventListener('click', () => {
      if (!studentData || studentData.Fine_Amount <= 0) {
        alert("No fine to pay!")
        return
      }

      const amountInPaise = studentData.Fine_Amount * 100

      const options = {
        key: "rzp_test_RZiyLx8tDkY0FA", // replace with your Razorpay key
        amount: amountInPaise,
        currency: "INR",
        name: "Library Fine Payment",
        description: `Paying fine for ${studentData.Student_Name}`,
        handler: function (response){
          // Payment successful → update Supabase
          updateFineInSupabase(studentData.Student_ID)
        },
        prefill: {
          name: studentData.Student_Name,
          email: studentData.Email || ""
        },
        theme: { color: "#3399cc" }
      }

      const rzp1 = new Razorpay(options)
      rzp1.open()
    })

    function updateFineInSupabase(studentId) {
      const url = `${supabaseUrl}/rest/v1/${tableName}?Student_ID=eq.${encodeURIComponent(studentId)}`

      fetch(url, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ Fine_Amount: 0 })
      })
      .then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`)
        return res.json()
      })
      .then(updatedData => {
        paymentStatus.textContent = "Fine paid successfully!"
        // Update local studentData and UI
        studentData.Fine_Amount = 0
        localStorage.setItem('studentData', JSON.stringify(studentData))
        displayStudent()
      })
      .catch(err => {
        console.error(err)
        paymentStatus.textContent = "Error updating fine. Contact admin."
      })
    }

    function logout() {
      localStorage.removeItem('studentData')
      window.location.href = 'index.html'
    }