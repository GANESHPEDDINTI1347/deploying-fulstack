/*********************************
 Backend API Base URL
**********************************/
const API_BASE = "https://backend-deployment-11.onrender.com";

/*********************************
 LOGIN
**********************************/
app.post("/login", async (req, res) => {
  const username = req.body.username.trim().toLowerCase();
  const password = req.body.password;

  const result = await pool.query(
    "SELECT id, username, password, role, studentid FROM users WHERE username=$1",
    [username]
  );

  if (!result.rows.length)
    return res.json({ success: false });

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password);

  if (!valid)
    return res.json({ success: false });

  // send only required data
  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      studentid: user.studentid
    }
  });
});


/*********************************
 LOGOUT
**********************************/
function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

/*********************************
 REGISTER
**********************************/
async function register() {
  const name = document.getElementById("name").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !username || !password) {
    alert("Fill all fields");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, password })
    });

    const data = await res.json();

    if (data.success) {
      alert("Registration successful! Please login.");
      window.location.href = "login.html";
    } else {
      alert(data.message || "Registration failed");
    }

  } catch {
    alert("Server error.");
  }
}

/*********************************
 LOAD STUDENT DASHBOARD DATA
**********************************/
async function loadStudent() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  try {
    const res = await fetch(
      `${API_BASE}/student/${user.studentid || user.studentId}`
    );

    const data = await res.json();

    const nameBox = document.getElementById("studentName");
    if (nameBox && data)
      nameBox.innerText = data.name;

  } catch (err) {
    console.log(err);
  }
}

/*********************************
 LOAD STUDENTS (ADMIN/STAFF)
**********************************/
async function loadStudents() {
  const table = document.getElementById("studentsTable");
  if (!table) return;

  try {
    const res = await fetch(`${API_BASE}/students`);
    const students = await res.json();

    table.innerHTML = "";

    students.forEach(s => {
      table.innerHTML += `
        <tr>
          <td>${s.id}</td>
          <td>${s.name}</td>
          <td>${s.attendance}</td>
        </tr>`;
    });

  } catch (err) {
    console.log(err);
  }
}

/*********************************
 CSV Upload
**********************************/
async function uploadCSV() {
  const fileInput = document.getElementById("csvFile");
  if (!fileInput) return;

  const file = fileInput.files[0];
  if (!file) {
    alert("Select CSV file");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API_BASE}/uploadStudents`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    const msgBox = document.getElementById("uploadMsg");

    if (msgBox)
      msgBox.innerText = data.message;

  } catch {
    alert("Upload failed");
  }
}

/*********************************
 UPDATE MARKS & ATTENDANCE
**********************************/
async function updateStudent() {
  const username = document.getElementById("username").value.trim();
  const attendance = document.getElementById("attendance").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const marks = document.getElementById("marks").value.trim();

  if (!username) {
    alert("Enter student username");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/updateByUsername`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        attendance,
        subject,
        marks
      })
    });

    const data = await res.json();

    document.getElementById("msg").innerText =
      data.message || "Updated";

    document.getElementById("subject").value = "";
    document.getElementById("marks").value = "";

  } catch {
    alert("Update failed");
  }
}


/*********************************
 ROLE ACCESS GUARD
**********************************/
function checkAccess(requiredRole) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  if (requiredRole && user.role !== requiredRole) {
    alert("Access denied");
    window.location.href = "login.html";
  }
}

