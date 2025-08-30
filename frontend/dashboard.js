document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('employee-search');
    const searchBtn = document.getElementById('search-btn');
    const viewAllBtn = document.getElementById('view-all-btn');
    const tableBody = document.getElementById('attendance-table-body');
    const totalTimeDisplay = document.getElementById('total-time');
    const BACKEND_URL = 'https://control-asistencia-metalotecnia.onrender.com';

    // Function to format dates
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Function to calculate total time
    const calculateTotalTime = (start, end) => {
        if (!start || !end) return '0h 0m';
        const startTime = new Date(start);
        const endTime = new Date(end);
        const diffInMinutes = Math.floor((endTime - startTime) / (1000 * 60));
        const hours = Math.floor(diffInMinutes / 60);
        const minutes = diffInMinutes % 60;
        return `${hours}h ${minutes}m`;
    };

    // Function to render data in the table
    const renderTable = (records) => {
        tableBody.innerHTML = '';
        let totalMinutes = 0;

        if (records.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-500 py-4">No hay registros de asistencia.</td></tr>';
            totalTimeDisplay.textContent = 'Tiempo Total de Trabajo: 0h 0m';
            return;
        }

        records.forEach(record => {
            const checkInTime = new Date(record.checkInTime);
            const checkOutTime = record.checkOutTime ? new Date(record.checkOutTime) : null;
            const timeDiff = checkOutTime ? (checkOutTime - checkInTime) : 0;
            totalMinutes += Math.floor(timeDiff / (1000 * 60));

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.employeeId}</td>
                <td>${record.employeeName}</td>
                <td>${record.task}</td>
                <td>${formatDate(record.checkInTime)}</td>
                <td>${formatDate(record.checkOutTime)}</td>
                <td>${calculateTotalTime(record.checkInTime, record.checkOutTime)}</td>
            `;
            tableBody.appendChild(row);
        });

        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        totalTimeDisplay.textContent = `Tiempo Total de Trabajo: ${totalHours}h ${remainingMinutes}m`;
    };

    // Function to fetch records from the server
    const fetchAttendance = async (employeeId = null) => {
        // Se corrige la URL de la API para obtener los registros
        let url = `${BACKEND_URL}/api/attendance`;
        if (employeeId) {
            url += `?employeeId=${employeeId}`;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error al obtener los registros:', errorData.message);
                renderTable([]);
                return;
            }
            const data = await response.json();
            renderTable(data);
        } catch (error) {
            console.error('Error de conexión con el servidor:', error);
            renderTable([]);
        }
    };

    // Button events
    searchBtn.addEventListener('click', () => {
        const employeeId = searchInput.value.trim();
        fetchAttendance(employeeId);
    });

    viewAllBtn.addEventListener('click', () => {
        searchInput.value = '';
        fetchAttendance();
    });

    // Load all records on initial page load
    fetchAttendance();
});