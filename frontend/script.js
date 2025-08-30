const employeeIdInput = document.getElementById('employee-id');
const statusContainer = document.getElementById('status-container');
const employeeNameElement = document.getElementById('employee-name');
const statusMessageElement = document.getElementById('status-message');
const checkinUi = document.getElementById('checkin-ui');
const checkoutUi = document.getElementById('checkout-ui');
const taskInput = document.getElementById('task');
const checkinBtn = document.getElementById('checkin-btn');
const checkoutBtn = document.getElementById('checkout-btn');
const messageContainer = document.getElementById('message-container');

// Ahora el backend está en la misma URL, por lo que no necesitamos una URL externa.
const BACKEND_URL = '';

const getAttendanceRecords = async (employeeId) => {
    const url = employeeId ? `${BACKEND_URL}/api/attendance?employeeId=${employeeId}` : `${BACKEND_URL}/api/attendance`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error al obtener los registros de asistencia');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};

const getEmployee = async (employeeId) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/employees/${employeeId}`);
        if (!response.ok) {
            return null;
        }
        return await response.json();
    } catch (error) {
        return null;
    }
};

const updateStatus = async (employeeId) => {
    const employee = await getEmployee(employeeId);
    if (!employee) {
        showMessage('ID de empleado no encontrado.', 'error');
        statusContainer.classList.add('hidden');
        return;
    }

    const attendanceRecords = await getAttendanceRecords(employeeId);
    const lastRecord = attendanceRecords[0];
    const hasCheckedIn = lastRecord && !lastRecord.checkOutTime;

    employeeNameElement.textContent = `Hola, ${employee.name}`;
    statusContainer.classList.remove('hidden');

    if (hasCheckedIn) {
        statusMessageElement.textContent = `Tu última entrada fue a las ${new Date(lastRecord.checkInTime).toLocaleTimeString()}.`;
        checkinUi.classList.add('hidden');
        checkoutUi.classList.remove('hidden');
        checkoutBtn.dataset.attendanceId = lastRecord._id;
    } else {
        statusMessageElement.textContent = `Por favor, registra tu entrada.`;
        checkinUi.classList.remove('hidden');
        checkoutUi.classList.add('hidden');
    }
};

const showMessage = (message, type) => {
    messageContainer.textContent = message;
    messageContainer.className = 'mt-4 text-center text-sm font-medium';
    if (type === 'success') {
        messageContainer.classList.add('text-green-600');
    } else if (type === 'error') {
        messageContainer.classList.add('text-red-600');
    }
};

const fetchEmployeeStatus = async (employeeId) => {
    if (!employeeId) {
        statusContainer.classList.add('hidden');
        return;
    }

    try {
        // Petición para obtener un empleado
        const employeeRes = await fetch(`${BACKEND_URL}/api/employees/${employeeId}`);
        if (!employeeRes.ok) {
            showMessage('ID de empleado no encontrado.', 'error');
            statusContainer.classList.add('hidden');
            return;
        }
        const employee = await employeeRes.json();
        
        // Petición para obtener registros de asistencia del empleado
        const attendanceRes = await fetch(`${BACKEND_URL}/api/attendance?employeeId=${employeeId}`);
        const attendance = await attendanceRes.json();
        const lastRecord = attendance[0];
        
        // Determinar estado
        const hasCheckedIn = lastRecord && !lastRecord.checkOutTime;

        employeeNameElement.textContent = `Hola, ${employee.name}`;
        statusContainer.classList.remove('hidden');

        if (hasCheckedIn) {
            statusMessageElement.textContent = `Tu última entrada fue a las ${new Date(lastRecord.checkInTime).toLocaleTimeString()}.`;
            checkinUi.classList.add('hidden');
            checkoutUi.classList.remove('hidden');
            checkoutBtn.dataset.attendanceId = lastRecord._id;
        } else {
            statusMessageElement.textContent = `Por favor, registra tu entrada.`;
            checkinUi.classList.remove('hidden');
            checkoutUi.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error al verificar el estado del empleado. Intenta de nuevo.', 'error');
        statusContainer.classList.add('hidden');
    }
};

employeeIdInput.addEventListener('input', (e) => {
    const employeeId = e.target.value;
    fetchEmployeeStatus(employeeId);
});

document.getElementById('attendance-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const employeeId = employeeIdInput.value;
    const task = taskInput.value;
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId, task })
        });
        
        if (response.ok) {
            showMessage('Entrada registrada con éxito.', 'success');
            taskInput.value = '';
            fetchEmployeeStatus(employeeId);
        } else {
            showMessage('Error al registrar la entrada.', 'error');
        }
    } catch (error) {
        showMessage('Error de conexión. Intenta de nuevo.', 'error');
    }
});

checkoutBtn.addEventListener('click', async () => {
    const attendanceId = checkoutBtn.dataset.attendanceId;
    const employeeId = employeeIdInput.value;
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/checkout/${attendanceId}`, {
            method: 'PATCH'
        });

        if (response.ok) {
            showMessage('Salida registrada con éxito.', 'success');
            fetchEmployeeStatus(employeeId);
        } else {
            showMessage('Error al registrar la salida.', 'error');
        }
    } catch (error) {
        showMessage('Error de conexión. Intenta de nuevo.', 'error');
    }
});

