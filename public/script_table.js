let currentSort = 'age'; // Default sorting column
let currentOrder = 'asc'; // Default sorting order

function sortTable(column) {
    // If the same column is clicked again, toggle the order
    if (currentSort === column) {
        currentOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort = column;
        currentOrder = 'asc'; // Reset to ascending order for a new column
    }
    fetchData(); // Fetch data with the new sort order
}

function fetchData() {
    const limit = document.getElementById('limit').value || 15;
    const url = `/data?limit=${limit}&sort=${currentSort}&order=${currentOrder}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('data-table').getElementsByTagName('tbody')[0];
            tableBody.innerHTML = ''; // Clear existing table rows
            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.age}</td>
                    <td>${row.job}</td>
                    <td>${row.marital}</td>
                    <td>${row.education}</td>
                    <td>${row.balance}</td>
                    <td>${row.day}</td>
                    <td>${row.month}</td>
                    <td>${row.duration}</td>
                    <!-- Add other columns based on your data -->
                `;
                tableBody.appendChild(tr);
            });
        });
}

// Fetch initial data when the page loads
window.onload = fetchData;

/* ============================================================================================================ */
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

