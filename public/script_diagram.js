function toggleDashboard() {
    var dashboard = document.getElementById('dashboardSection');
    if (dashboard.style.display === 'none' || dashboard.style.display === '') {
        dashboard.style.display = 'block';
    } else {
        dashboard.style.display = 'none';
    }
}
google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawChart);

document.getElementById('filterBy').addEventListener('change', drawChart);

function drawChart() {
    const filterType = document.getElementById('filterBy').value;
    let filterValue = ''; // ใช้เก็บค่าจากตัวกรองที่เลือก

    // สร้างตัวกรองตามประเภทที่เลือก
    if (filterType === 'loan') {
        filterValue = document.querySelector('input[name="loanStatus"]:checked')?.value || '';
    } else if (filterType === 'contact') {
        filterValue = document.querySelector('input[name="contactMethod"]:checked')?.value || '';
    }

    fetch(`/data-distribution?filterType=${filterType}&filterValue=${filterValue}`)
        .then(response => response.json())
        .then(data => {
            const chartData = [['Category', 'Count']];
            data.forEach(row => {
                chartData.push([row.category.toString(), row.count]);
            });

            const dataTable = google.visualization.arrayToDataTable(chartData);

            const options = {
                title: `${filterType.charAt(0).toUpperCase() + filterType.slice(1)} Distribution`,
                hAxis: { title: filterType.charAt(0).toUpperCase() + filterType.slice(1) },
                vAxis: { title: 'Number of Customers' },
                legend: 'none'
            };

            const chart = new google.visualization.ColumnChart(document.getElementById('bar_chart_div'));
            chart.draw(dataTable, options);
        });
}

//Financial Dashboard (แผงข้อมูลทางการเงิน)
document.addEventListener('DOMContentLoaded', function () {
    google.charts.load('current', { packages: ['corechart', 'bar'] });
    google.charts.setOnLoadCallback(drawAllCharts);

    function drawAllCharts() {
        drawBalanceDistribution();
        // drawLoanVsHousing();
        drawDefaultStatus();
    }

    // วาดกราฟ Histogram สำหรับการกระจายตัวของยอดคงเหลือ
    function drawBalanceDistribution() {
        fetch('/financial-data?chartType=balance')
            .then(response => response.json())
            .then(data => {
                const chartData = [['Balance']];
                data.forEach(row => {
                    chartData.push([row.balance]);
                });
                const dataTable = google.visualization.arrayToDataTable(chartData);
                const options = {
                    title: 'Balance Distribution (การกระจายตัวของยอดคงเหลือ)',
                    legend: { position: 'none' },
                    hAxis: { title: 'Balance' },
                    vAxis: { title: 'Frequency' }
                };
                const chart = new google.visualization.Histogram(document.getElementById('balance_chart_div'));
                chart.draw(dataTable, options);
            });
    }



    // วาดกราฟ Pie หรือ Donut สำหรับสถานะการผิดนัดชำระ
    function drawDefaultStatus() {
        fetch('/financial-data?chartType=default_status')
            .then(response => response.json())
            .then(data => {
                const chartData = [['Default Status', 'Count']];
                data.forEach(row => {
                    chartData.push([row.status, row.count]);
                });

                const dataTable = google.visualization.arrayToDataTable(chartData);
                const options = {
                    title: 'Default Status (การผิดนัดชำระ)',
                    pieHole: 0.4,  // สำหรับ Donut chart
                };

                const chart = new google.visualization.PieChart(document.getElementById('default_status_chart_div'));
                chart.draw(dataTable, options);
            });
    }
});

// โหลด Google Charts
google.charts.load('current', { packages: ['corechart', 'line'] });
google.charts.setOnLoadCallback(drawCampaignAnalysisChart);

// ฟังก์ชันวาดกราฟสำหรับ Campaign Analysis Dashboard
function drawCampaignAnalysisChart() {
    fetch('/campaign-analysis')
        .then(response => response.json())
        .then(data => {
            const chartData = [['Previous Contacts', 'Success Rate (%)']];
            data.forEach(row => {
                chartData.push([row.previous, row.success_rate]);
            });
            const dataTable = google.visualization.arrayToDataTable(chartData);
            const options = {
                title: 'Previous Contacts vs Success Rate (การติดต่อก่อนหน้ากับอัตราความสำเร็จ)',
                hAxis: { title: 'Previous Contacts' },
                vAxis: { title: 'Success Rate (%)' },
                curveType: 'function',  // สำหรับ Line Chart ที่นุ่มนวลขึ้น
                legend: { position: 'bottom' }
            };

            const chart = new google.visualization.LineChart(document.getElementById('campaign_analysis_chart_div'));
            chart.draw(dataTable, options);
        })
        .catch(err => {
            console.error('Error fetching campaign analysis data:', err);
        });
}

// โหลด Google Charts
google.charts.load('current', { packages: ['corechart', 'line'] });
google.charts.setOnLoadCallback(drawContactsAnalysisChart);

// ฟังก์ชันวาดกราฟเมื่อมีการเปลี่ยนแปลง filter
document.getElementById('contactsFilter').addEventListener('change', drawContactsAnalysisChart);

// ฟังก์ชันวาดกราฟสำหรับ Contacts Analysis Dashboard
function drawContactsAnalysisChart() {
    const chartType = document.getElementById('contactsFilter').value;

    fetch(`/contacts-analysis?chartType=${chartType}`)
        .then(response => response.json())
        .then(data => {
            let chartData = [];
            let options = {};

            if (chartType === 'contacts_per_day' || chartType === 'contacts_per_month') {
                chartData = [['Date', 'Contact Count']];
                data.forEach(row => {
                    chartData.push([row.contact_date || row.contact_month, row.contact_count]);
                });

                options = {
                    title: chartType === 'contacts_per_day' ? 'Contacts per Day' : 'Contacts per Month',
                    hAxis: { title: 'Date' },
                    vAxis: { title: 'Contact Count' },
                    legend: { position: 'none' }

                };

            } else if (chartType === 'success_rate_per_month') {
                chartData = [['Month', 'Success Rate (%)']];
                data.forEach(row => {
                    const successRate = (row.success_count / row.total_count) * 100;
                    chartData.push([row.contact_month, successRate]);
                });

                options = {
                    title: 'Success Rate per Month',
                    hAxis: { title: 'Month' },
                    vAxis: { title: 'Success Rate (%)' },
                    curveType: 'function',
                    legend: { position: 'none' }
                };

            }
            const dataTable = google.visualization.arrayToDataTable(chartData);
            const chart = new google.visualization.LineChart(document.getElementById('contacts_analysis_chart_div'));
            chart.draw(dataTable, options);
        })
        .catch(err => {
            console.error('Error fetching contacts analysis data:', err);
        });
}

//<!-- Correlation Dashboard -->
google.charts.load('current', { packages: ['corechart', 'line'] });
google.charts.setOnLoadCallback(drawareachart);

// document.getElementById('educationFilter').addEventListener('change', drawareachart);
function drawareachart() {
    // const educationLevel = document.getElementById('educationFilter').value;
    fetch(`/education-success-rate?education=`)//${educationLevel}
        .then(response => response.json())
        .then(data => {
            const chartData = [['Education Level', 'Success Rate (%)']];
            data.forEach(row => {
                chartData.push([row.education, row.success_rate]);
            });
            const dataTable = google.visualization.arrayToDataTable(chartData);

            const options = {
                title: 'Education vs Success Rate',
                hAxis: { title: 'Education Level' },
                vAxis: { title: 'Success Rate (%)' },
                legend: { position: 'bottom' },
                areaOpacity: 0.4,
                // colors: ['#1b9e77']
            };
            const chart = new google.visualization.AreaChart(document.getElementById('education_success_rate_chart_div'));
            chart.draw(dataTable, options);
        });
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


