const supabaseUrl = 'https://zpdauvgblndbnpttzrbo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwZGF1dmdibG5kYm5wdHR6cmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzOTQ0ODcsImV4cCI6MjA3Njk3MDQ4N30.NyVZQwCrXJELVPcwWDHYH4zrbN4b4Mq88hYMnNTmhLg'
const tableName = 'library_usage'

 document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault()

      const studentId = document.getElementById('studentId').value.toUpperCase();
      const password = document.getElementById('password').value

      const url = `${supabaseUrl}/rest/v1/${tableName}?select=*&Student_ID=eq.${encodeURIComponent(studentId)}&password=eq.${encodeURIComponent(password)}`

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) throw new Error(`Server error: ${response.status}`)

        const data = await response.json()

        if (data.length === 0) {
          alert('Invalid Student ID or Password!')
        } else {
          const student = data[0]

          // 🧠 Save student data to localStorage
          localStorage.setItem('studentData', JSON.stringify(student))

          // 🚀 Redirect to dashboard
          window.location.href = 'studentdashboard.html'
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        alert('Something went wrong! Check console for details.')
      }
    })