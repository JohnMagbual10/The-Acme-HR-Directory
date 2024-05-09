const express = require('express');
const pg = require('pg');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost/acme_hr_directory';
const client = new pg.Client({ connectionString: DATABASE_URL });

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// Function to fetch employees from the database
async function fetchEmployeesFromDatabase() {
  const query = 'SELECT * FROM employees';
  const result = await client.query(query);
  return result.rows;
}

// Function to fetch departments from the database
async function fetchDepartmentsFromDatabase() {
  const query = 'SELECT * FROM departments';
  const result = await client.query(query);
  return result.rows;
}

// Function to create employee in the database
async function createEmployeeInDatabase(name, department_id) {
  // Implement your database query logic here
}

// Function to delete employee from the database
async function deleteEmployeeFromDatabase(id) {
  // Implement your database query logic here
}

// Function to update employee in the database
async function updateEmployeeInDatabase(id, name, department_id) {
  // Implement your database query logic here
}

// GET /api/employees - returns array of employees
app.get('/api/employees', async (req, res, next) => {
  try {
    // Fetch employees from the database
    const employees = await fetchEmployeesFromDatabase();
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/departments - returns an array of departments
app.get('/api/departments', async (req, res, next) => {
  try {
    // Fetch departments from the database
    const departments = await fetchDepartmentsFromDatabase();
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/employees - payload: the employee to create, returns the created employee
app.post('/api/employees', async (req, res, next) => {
  try {
    const { name, department_id } = req.body;
    // Insert the new employee into the database
    // Replace this with your actual database query
    const createdEmployee = await createEmployeeInDatabase(name, department_id);
    res.json(createdEmployee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/employees/:id - the id of the employee to delete is passed in the URL, returns nothing
app.delete('/api/employees/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    // Delete the employee from the database
    // Replace this with your actual database query
    await deleteEmployeeFromDatabase(id);
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/employees/:id - payload: the updated employee returns the updated employee
app.put('/api/employees/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, department_id } = req.body;
    // Update the employee in the database
    // Replace this with your actual database query
    const updatedEmployee = await updateEmployeeInDatabase(id, name, department_id);
    res.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling route
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize the server
const init = async () => {
  try {
    console.log('Initializing server...');

    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Perform database initialization tasks
    console.log('Initializing database...');
    let SQL = `
      DROP TABLE IF EXISTS employees;
      DROP TABLE IF EXISTS departments;
      CREATE TABLE departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100)
      );
      CREATE TABLE employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        department_id INTEGER REFERENCES departments(id)
      );
      INSERT INTO departments (name) VALUES ('HR'), ('Finance'), ('IT');
      INSERT INTO employees (name, department_id) VALUES ('John Megaball', 1), ('Xiaojia Chin', 2), ('Tiffany Newin', 3);
    `;
    await client.query(SQL);
    console.log('Tables created and sample data inserted');

    // Start the Express server
    console.log('Starting server...');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Error initializing server:', error);
    process.exit(1); // Exit with non-zero status code to indicate failure
  }
};

// Invoke the init function to start the server
init();
