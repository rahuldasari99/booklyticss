const supabaseUrl = 'https://pgnkoowjfxtsbxddipxk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbmtvb3dqZnh0c2J4ZGRpcHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NTQ0MzIsImV4cCI6MjA3NzEzMDQzMn0.RPIClQMK14sVlNhmXji8YVO1hGp4Cnt3lwqrW4ym7xA';

// Table names
const studentTable = 'library_usage';
const adminTable = 'admin_data';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const studentId = document.getElementById('studentId').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    // 1️⃣ Check if admin login
    const adminUrl = `${supabaseUrl}/rest/v1/${adminTable}?select=*&admin_id=eq.${encodeURIComponent(studentId)}&admin_password=eq.${encodeURIComponent(password)}`;
    console.log('Admin URL:', adminUrl)

    const adminResponse = await fetch(adminUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!adminResponse.ok) throw new Error(`Admin fetch failed: ${adminResponse.status}`);

    const adminData = await adminResponse.json();

    if (adminData.length > 0) {
      // ✅ Admin found
      localStorage.setItem('adminData', JSON.stringify(adminData[0]));
      alert('Admin login successful!');
      window.location.href = 'admin.html';
      return; // Stop here if admin logged in
    }

    // 2️⃣ Check if student login
    const studentUrl = `${supabaseUrl}/rest/v1/${studentTable}?select=*&Student_ID=eq.${encodeURIComponent(studentId)}&password=eq.${encodeURIComponent(password)}`;

    const studentResponse = await fetch(studentUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!studentResponse.ok) throw new Error(`Student fetch failed: ${studentResponse.status}`);

    const studentData = await studentResponse.json();

    if (studentData.length > 0) {
      // ✅ Student found
      localStorage.setItem('studentData', JSON.stringify(studentData[0]));
      alert('Student login successful!');
      window.location.href = 'studentdashboard.html';
    } else {
      // ❌ No match found
      alert('Invalid ID or Password!');
    }

  } catch (err) {
    console.error('Error during login:', err);
    alert('Something went wrong! Check console for details.');
  }
});
