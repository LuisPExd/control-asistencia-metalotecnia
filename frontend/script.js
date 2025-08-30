document.addEventListener('DOMContentLoaded', () => {
    const employeeIdInput = document.getElementById('employee-id');
    const statusContainer = document.getElementById('status-container');
    const employeeNameDisplay = document.getElementById('employee-name');
    const statusMessageDisplay = document.getElementById('status-message');
    const checkinUi = document.getElementById('checkin-ui');
    const checkoutUi = document.getElementById('checkout-ui');
    const taskInput = document.getElementById('task');
    const attendanceForm = document.getElementById('attendance-form');
    const messageContainer = document.getElementById('message-container');

    let currentAttendanceId = null;

    function showMessage(message, type = 'success') {
        messageContainer.textContent = message;
        messageContainer.className = `mt-4 text-center text-sm font-medium ${type === 'success' ? 'text-green-600' : 'text-red-600'}`;
    }

    async function fetchEmployeeStatus(employeeId) {
        if (!employeeId) {
            statusContainer.classList.add('hidden');
            return;
        }

        try {
            const employeeRes = await fetch(`http://localhost:3000/api/employees/${employeeId}`);
            if (!employeeRes.ok) {
                showMessage('ID de empleado no encontrado.', 'error');
                statusContainer.classList.add('hidden');
                return;
            }
            const employee = await employeeRes.json();
            employeeNameDisplay.textContent = `Hola, ${employee.name}`;
            
            // Check for active attendance record
            const attendanceRes = await fetch(`http://localhost:3000/api/attendance?employeeId=${employeeId}`);
            const records = await attendanceRes.json();
            const activeRecord = records.find(record => !record.checkOutTime);

            statusContainer.classList.remove('hidden');

            if (activeRecord) {
                currentAttendanceId = activeRecord._id;
                statusMessageDisplay.textContent = 'Ya tienes una entrada registrada. Por favor, marca tu salida.';
                checkinUi.classList.add('hidden');
                checkoutUi.classList.remove('hidden');
            } else {
                currentAttendanceId = null;
                statusMessageDisplay.textContent = 'No tienes una entrada activa. Por favor, marca tu entrada.';
                checkinUi.classList.remove('hidden');
                checkoutUi.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error al verificar el estado del empleado. Intenta de nuevo.', 'error');
            statusContainer.classList.add('hidden');
        }
    }

    employeeIdInput.addEventListener('input', (e) => {
        fetchEmployeeStatus(e.target.value);
    });

    attendanceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const employeeId = employeeIdInput.value;
        const task = taskInput.value;

        if (!employeeId || !task) {
            showMessage('Por favor, ingresa tu ID y la tarea.', 'error');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeId, task })
            });

            if (response.ok) {
                showMessage('Entrada registrada con éxito.');
                employeeIdInput.value = '';
                taskInput.value = '';
                statusContainer.classList.add('hidden');
            } else {
                const errorData = await response.json();
                showMessage(errorData.message || 'Error al registrar la entrada.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error de conexión con el servidor. Intenta de nuevo.', 'error');
        }
    });

    document.getElementById('checkout-btn').addEventListener('click', async () => {
        if (!currentAttendanceId) {
            showMessage('No se encontró un registro de entrada activo. Intenta de nuevo.', 'error');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/checkout/${currentAttendanceId}`, {
                method: 'PATCH'
            });

            if (response.ok) {
                showMessage('Salida registrada con éxito.');
                employeeIdInput.value = '';
                taskInput.value = '';
                statusContainer.classList.add('hidden');
                currentAttendanceId = null;
            } else {
                const errorData = await response.json();
                showMessage(errorData.message || 'Error al registrar la salida.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error de conexión con el servidor. Intenta de nuevo.', 'error');
        }
    });
});