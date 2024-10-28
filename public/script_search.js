/* Data Count Dashboard styling */
function toggleDashboard() {
    var dashboard = document.getElementById('dashboardSection');
    if (dashboard.style.display === 'none' || dashboard.style.display === '') {
        dashboard.style.display = 'block';
    } else {
        dashboard.style.display = 'none';
    }
}
// ฟังก์ชันเพื่อดึงค่าที่ไม่ซ้ำกันสำหรับคอลัมน์ที่เลือก
function fetchUniqueValues(column, selectElementId) {
    if (!column) {
        document.getElementById(selectElementId).innerHTML = '<option value="">-- Select Value --</option>';
        return;
    }

    fetch(`/unique-values?column=${column}`)
        .then(response => response.json())
        .then(values => {
            let options = '<option value="">-- Select Value --</option>';
            values.forEach(value => {
                options += `<option value="${value}">${value}</option>`;
            });
            document.getElementById(selectElementId).innerHTML = options;
        })
        .catch(err => {
            console.error('Error fetching unique values:', err);
        });
}
// Event listener สำหรับการเปลี่ยนแปลงคอลัมน์ที่เลือก
document.getElementById('filterColumn').addEventListener('change', function () {
    const selectedColumn = this.value;
    fetchUniqueValues(selectedColumn, 'filterValue');
});

// ฟังก์ชันเพื่อดึงจำนวนข้อมูลตามฟิลเตอร์เดียว
document.getElementById('getCountButton').addEventListener('click', function () {
    const column = document.getElementById('filterColumn').value;
    const value = document.getElementById('filterValue').value;

    if (!column || !value) {
        alert('กรุณาเลือกฟิลเตอร์และค่า');
        return;
    }

    fetch(`/data-count?column=${column}&value=${encodeURIComponent(value)}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('dataCount').textContent = data.count;
        })
        .catch(err => {
            console.error('Error fetching data count:', err);
        });
});

/* ============================================================================================================ */
function searchData() {
    const age = document.getElementById('age').value;
    const job = document.getElementById('job').value;
    const marital = document.getElementById('marital').value;

    const queryParams = new URLSearchParams();
    if (age) queryParams.append('age', age);
    if (job) queryParams.append('job', job);
    if (marital) queryParams.append('marital', marital);

    fetch(`/search?${queryParams.toString()}`)
        .then(response => response.json())
        .then(data => {
            const resultsBody = document.getElementById('resultsBody');
            resultsBody.innerHTML = '';  // Clear previous results

            if (data.length > 0) {
                data.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.age}</td>
                        <td>${item.job}</td>
                        <td>${item.marital}</td>
                        <td>${item.education}</td>
                        <td>${item.balance}</td>
                        <td>${item.contact}</td>
                        <td>${item.loan}</td>
                        <td>${item.day}</td>
                        <td>${item.month}</td>
                    `;
                    resultsBody.appendChild(row);
                });
            } else {
                resultsBody.innerHTML = '<tr><td colspan="6">No results found</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}