const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Conectado a la base de datos de MongoDB'))
    .catch(err => console.error('Error de conexión a la base de datos', err));

// Esquemas y modelos de Mongoose
const attendanceSchema = new mongoose.Schema({
    employeeId: { type: String, required: true },
    employeeName: { type: String },
    task: { type: String, required: true },
    checkInTime: { type: Date, default: Date.now },
    checkOutTime: { type: Date, default: null }
});

const employeeSchema = new mongoose.Schema({
    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true }
});

const Attendance = mongoose.model('Attendance', attendanceSchema);
const Employee = mongoose.model('Employee', employeeSchema);

// Exportar los modelos para que otros archivos puedan usarlos
module.exports = { Attendance, Employee };

// --- RUTAS API ---

// Nueva ruta de prueba para verificar que el servidor está activo
app.get('/', (req, res) => {
    res.send('Servidor de control de asistencia activo.');
});

// Ruta para obtener un empleado por su ID
app.get('/api/employees/:employeeId', async (req, res) => {
    try {
        const employeeId = req.params.employeeId;
        const employee = await Employee.findOne({ employeeId: employeeId });
        if (!employee) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }
        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
});

// Ruta para registrar la entrada (Check-in)
app.post('/api/checkin', async (req, res) => {
    try {
        const { employeeId, task } = req.body;
        
        // Buscar el nombre del empleado en la colección de empleados
        const employee = await Employee.findOne({ employeeId });
        
        const newRecord = new Attendance({
            employeeId,
            employeeName: employee ? employee.name : 'Desconocido',
            task,
            checkInTime: new Date()
        });

        await newRecord.save();
        res.status(201).json({ message: 'Entrada registrada con éxito', record: newRecord });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar la entrada', error });
    }
});

// Ruta para registrar la salida (Check-out)
app.patch('/api/checkout/:attendanceId', async (req, res) => {
    try {
        const attendanceId = req.params.attendanceId;
        const record = await Attendance.findById(attendanceId);

        if (!record) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }

        // Verifica si la salida ya fue registrada
        if (record.checkOutTime) {
            return res.status(400).json({ message: 'La salida ya ha sido registrada para este turno' });
        }
        
        record.checkOutTime = new Date();
        await record.save();

        res.status(200).json({ message: 'Salida registrada con éxito', record });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar la salida', error });
    }
});

// Ruta para obtener registros de asistencia de un empleado (o todos si no se especifica ID)
app.get('/api/attendance', async (req, res) => {
    try {
        const { employeeId } = req.query;
        let filter = {};

        if (employeeId) {
            filter = { employeeId: employeeId };
        }
        
        const attendanceRecords = await Attendance.find(filter).sort({ checkInTime: -1 });
        res.status(200).json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

