const mongoose = require('mongoose');
const { Employee } = require('./server');
require('dotenv').config();


async function seedEmployees() {
    try {
        // Conexión a la base de datos de MongoDB Atlas
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado a MongoDB para poblar la base de datos...');
        
        // Eliminar empleados existentes para evitar duplicados
        await Employee.deleteMany({});
        console.log('Colección de empleados limpiada.');

        const employees = [
            { employeeId: '1', name: 'Angelo' },
            { employeeId: '2', name: 'Diego' },
            { employeeId: '3', name: 'Dulce' },
            { employeeId: '4', name: 'Luis' },
        ];

        await Employee.insertMany(employees);
        console.log('Lista de empleados creados con éxito.');
    } catch (error) {
        console.error('Error al poblar la base de datos:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seedEmployees();