// ✅ LOGIN FUNCTION
async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("https://backend-deployment-1-5kgv.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!data.success) {
      alert("Invalid Login");
      return;
    }

    localStorage.setItem("user", JSON.stringify(data.user));

    // Role-based redirect
    if (data.user.role === "staff") {
      window.location.href = "staff.html";
    } else if (data.user.role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "dashboard.html";
    }

  } catch (error) {
    alert("Server error.");
  }
}

// ✅ LOGOUT FUNCTION
function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

async function uploadCSV() {
  const fileInput = document.getElementById("csvFile");
  const file = fileInput.files[0];

  if (!file) return alert("Select CSV file");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("https://backend-deployment-1-5kgv.onrender.com/uploadStudents", {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  document.getElementById("uploadMsg").innerText = data.message;
}


// ✅ REGISTER FUNCTION
async function register() {
  const name = document.getElementById("name").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("https://backend-deployment-1-5kgv.onrender.com/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, password })
    });

    const data = await res.json();

    if (data.success) {
      alert("Registration successful! Please login.");
      window.location.href = "login.html";
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert("Registration failed.");
  }
}

// ✅ ROLE GUARD (only once)
function checkAccess(requiredRole) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  if (user.role !== requiredRole) {
    alert("Access denied");
    window.location.href = "login.html";
  }
}

