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
    const currentUser = localStorage.getItem("CURRENT_USER");
    const students = getStudents();
    const st = students.find(s => s.voterId === currentUser);

    if (st && st.hasVoted) {
        alert("You have already voted");
        location.href = "result.html";
    }
}

// =====================================
// MAIN DOM LOAD
// =====================================
document.addEventListener("DOMContentLoaded", () => {

    // =================================
    // DYNAMIC YEAR LOGIC
    // =================================
    const deptSelect = document.getElementById("department");
    const yearSelect = document.getElementById("year");

    if (deptSelect && yearSelect) {
        deptSelect.addEventListener("change", () => {
            yearSelect.innerHTML = `<option value="">Select Year</option>`;

            const dept = deptSelect.value;

            // MCA / MBA → 2 years
            if (dept === "MCA" || dept === "MBA") {
                yearSelect.innerHTML += `
                    <option>1st Year</option>
                    <option>2nd Year</option>
                `;
            }
            // Engineering → 4 years
            else if (["CSE", "CIVIL", "MECH", "ECE"].includes(dept)) {
                yearSelect.innerHTML += `
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                `;
            }
            // UG → 3 years
            else {
                yearSelect.innerHTML += `
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                `;
            }
        });
    }

    // =================================
    // STUDENT REGISTRATION
    // =================================
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", e => {
            e.preventDefault();

            const name = document.getElementById("name").value.trim();
            const voterId = document.getElementById("voterId").value.trim();
            const department = deptSelect.value;
            const yearVal = yearSelect.value;
            const section = document.getElementById("section").value;
            const age = Number(document.getElementById("age").value);

            if (!name || !voterId || !department || !yearVal || !section || !age) {
                alert("Please fill all fields");
                return;
            }

            if (age < 18) {
                alert("Age must be 18 or above");
                return;
            }

            let students = getStudents();

            if (students.find(s => s.voterId === voterId)) {
                alert("Student already registered");
                return;
            }

            students.push({
                name,
                voterId,
                department,
                year: yearVal,
                section,
                age,
                hasVoted: false
            });

            saveStudents(students);

            document.getElementById("msg").classList.remove("d-none");

            setTimeout(() => {
                location.href = "login.html";
            }, 1500);
        });
    }

    // =================================
    // STUDENT LOGIN
    // =================================
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", e => {
            e.preventDefault();

            const loginInput = document.getElementById("loginId");
            const students = getStudents();
            const student = students.find(s => s.voterId === loginInput.value.trim());

            if (!student) {
                alert("Student not registered");
                return;
            }

            localStorage.setItem("CURRENT_USER", student.voterId);
            location.href = "vote.html";
        });
    }

    // =================================
    // LOAD CANDIDATES (CR + PRESIDENT)
    // =================================
    const crList = document.getElementById("crList");
    const presList = document.getElementById("presidentList");

    if (crList && presList) {
        const candidates = JSON.parse(localStorage.getItem("CANDIDATES")) || [];

        candidates.forEach(c => {
            const html = `
                <div class="form-check">
                    <input class="form-check-input" type="radio"
                           name="${c.post}" value="${c.name}" required>
                    <label class="form-check-label">${c.name}</label>
                </div>
            `;

            if (c.post === "CR") crList.innerHTML += html;
            if (c.post === "President") presList.innerHTML += html;
        });
    }

    // =================================
    // VOTING (SINGLE SUBMIT)
    // =================================
    const voteForm = document.getElementById("voteForm");

    if (voteForm) {
        voteForm.addEventListener("submit", e => {
            e.preventDefault();

            const crVote = document.querySelector('input[name="CR"]:checked');
            const presVote = document.querySelector('input[name="President"]:checked');

            if (!crVote || !presVote) {
                alert("Please vote for BOTH CR and President");
                return;
            }

            const currentUser = localStorage.getItem("CURRENT_USER");
            let students = getStudents();
            let student = students.find(s => s.voterId === currentUser);

            if (!student || student.hasVoted) {
                alert("Voting not allowed");
                location.href = "result.html";
                return;
            }

            let votes = JSON.parse(localStorage.getItem("VOTES")) || {
                CR: {},
                PRESIDENT: {}
            };

            votes.CR[crVote.value] = (votes.CR[crVote.value] || 0) + 1;
            votes.PRESIDENT[presVote.value] =
                (votes.PRESIDENT[presVote.value] || 0) + 1;

            localStorage.setItem("VOTES", JSON.stringify(votes));

            student.hasVoted = true;
            saveStudents(students);

            alert("Vote submitted successfully");
            location.href = "result.html";
        });
    }
});

// =====================================
// RESULTS + BAR CHARTS
// =====================================
function showResults() {
    const votes = JSON.parse(localStorage.getItem("VOTES")) || {
        CR: {},
        PRESIDENT: {}
    };

    drawResults("crResultList", "crChart", votes.CR, "CR Votes", "#22c55e");
    drawResults("presidentResultList", "presidentChart", votes.PRESIDENT, "President Votes", "#3b82f6");
}

function drawResults(listId, chartId, data, label, color) {
    const list = document.getElementById(listId);
    const ctx = document.getElementById(chartId);

    if (!list || !ctx) return;

    const names = Object.keys(data);
    const counts = Object.values(data);

    list.innerHTML = names.length
        ? names.map((n, i) =>
            `<li class="list-group-item">${n} : ${counts[i]} votes</li>`
        ).join("")
        : `<li class="list-group-item text-center">No votes recorded</li>`;

    if (names.length) {
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: names,
                datasets: [{
                    label,
                    data: counts,
                    backgroundColor: color
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
}
