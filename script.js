// =====================================
// GLOBAL HELPERS
// =====================================
function getStudents() {
    return JSON.parse(localStorage.getItem("STUDENTS")) || [];
}
function saveStudents(data) {
    localStorage.setItem("STUDENTS", JSON.stringify(data));
}

// =====================================
// BLOCK RE-VOTING (ONLY VOTE PAGE)
// =====================================
if (location.pathname.includes("vote.html")) {
    const user = localStorage.getItem("CURRENT_USER");
    const students = getStudents();
    const st = students.find(s => s.voterId === user);
    if (st && st.hasVoted) {
        alert("You already voted");
        location.href = "result.html";
    }
}

// =====================================
// MAIN DOM
// =====================================
document.addEventListener("DOMContentLoaded", () => {

    // ---------- YEAR LOGIC ----------
    const dept = document.getElementById("department");
    const year = document.getElementById("year");

    if (dept && year) {
        dept.addEventListener("change", () => {
            year.innerHTML = `<option value="">Select Year</option>`;

            if (dept.value === "MCA" || dept.value === "MBA") {
                year.innerHTML += `
                    <option>1st Year</option>
                    <option>2nd Year</option>`;
            }
            else if (["CSE","CIVIL","MECH","ECE"].includes(dept.value)) {
                year.innerHTML += `
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>`;
            }
            else {
                year.innerHTML += `
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>`;
            }
        });
    }

// ---------- STUDENT REGISTRATION (FIXED 100%) ----------
const regForm = document.getElementById("registerForm");

if (regForm) {
    regForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const voterId = document.getElementById("voterId").value.trim();
        const department = document.getElementById("department").value;
        const year = document.getElementById("year").value;
        const section = document.getElementById("section").value;
        const age = document.getElementById("age").value;

        if (!name || !voterId || !department || !year || !section || !age) {
            alert("Please fill all fields");
            return;
        }

        if (age < 18) {
            alert("Age must be 18 or above");
            return;
        }

        let students = JSON.parse(localStorage.getItem("STUDENTS")) || [];

        if (students.find(s => s.voterId === voterId)) {
            alert("Student already registered");
            return;
        }

        students.push({
            name,
            voterId,
            department,
            year,
            section,
            age,
            hasVoted: false
        });

        localStorage.setItem("STUDENTS", JSON.stringify(students));

        document.getElementById("msg").classList.remove("d-none");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
    });
}

    // ---------- LOGIN ----------
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", e => {
            e.preventDefault();
            const students = getStudents();
            const st = students.find(s => s.voterId === loginId.value.trim());
            if (!st) return alert("Not registered");
            localStorage.setItem("CURRENT_USER", st.voterId);
            location.href = "vote.html";
        });
    }

    // ---------- LOAD CANDIDATES ----------
    const crList = document.getElementById("crList");
    const presList = document.getElementById("presidentList");
    if (crList && presList) {
        const cands = JSON.parse(localStorage.getItem("CANDIDATES")) || [];
        cands.forEach(c => {
            const html = `
              <div class="form-check">
                <input type="radio" class="form-check-input"
                       name="${c.post}" value="${c.name}" required>
                <label>${c.name}</label>
              </div>`;
            if (c.post === "CR") crList.innerHTML += html;
            if (c.post === "President") presList.innerHTML += html;
        });
    }

    // ---------- VOTE ----------
    const voteForm = document.getElementById("voteForm");
    if (voteForm) {
        voteForm.addEventListener("submit", e => {
            e.preventDefault();

            const cr = document.querySelector('input[name="CR"]:checked');
            const pr = document.querySelector('input[name="President"]:checked');
            if (!cr || !pr) return alert("Vote both");

            let votes = JSON.parse(localStorage.getItem("VOTES")) || {CR:{}, PRESIDENT:{}};
            votes.CR[cr.value] = (votes.CR[cr.value] || 0) + 1;
            votes.PRESIDENT[pr.value] = (votes.PRESIDENT[pr.value] || 0) + 1;
            localStorage.setItem("VOTES", JSON.stringify(votes));

            const students = getStudents();
            const st = students.find(s => s.voterId === localStorage.getItem("CURRENT_USER"));
            st.hasVoted = true;
            saveStudents(students);

            location.href = "result.html";
        });
    }
});

// =====================================
// RESULTS
// =====================================
function showResults() {
    const votes = JSON.parse(localStorage.getItem("VOTES")) || {CR:{}, PRESIDENT:{}};
    draw("crResultList", "crChart", votes.CR, "CR Votes", "#22c55e");
    draw("presidentResultList", "presidentChart", votes.PRESIDENT, "President Votes", "#3b82f6");
}

function draw(listId, chartId, data, label, color) {
    const list = document.getElementById(listId);
    const ctx = document.getElementById(chartId);
    if (!list || !ctx) return;

    const names = Object.keys(data);
    const counts = Object.values(data);
    list.innerHTML = names.length
        ? names.map((n,i)=>`<li class="list-group-item">${n}: ${counts[i]}</li>`).join("")
        : `<li class="list-group-item text-center">No votes</li>`;

    if (names.length)
        new Chart(ctx,{type:"bar",data:{labels:names,datasets:[{label,data:counts,backgroundColor:color}]}});
}
