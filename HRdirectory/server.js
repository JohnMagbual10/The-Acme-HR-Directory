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

// Define your routes here
// GET /api/employees - returns array of employees
app.get('/api/employees', async (req, res, next) => {
  try {
    // Fetch employees from the database
    // Replace this with your actual database query
    const employees = await fetchEmployeesFromDatabase();
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/departments - returns an array of departments
app.get('/', (req, res) => {
  res.send('Server is running');
});

app.get('/api/departments', async (req, res, next) => {
  try {
    // Fetch departments from the database
    // Replace this with your actual database query
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
      DROP TABLE IF EXISTS notes;
      DROP TABLE IF EXISTS categories;
      CREATE TABLE categories(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100)
      );
      CREATE TABLE notes(
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        ranking INTEGER DEFAULT 3 NOT NULL,
        txt VARCHAR(255) NOT NULL,
        category_id INTEGER REFERENCES categories(id) NOT NULL
      );
    `;
    await client.query(SQL);
    console.log('Tables created');

    // Seed the database with initial data
    console.log('Seeding data...');
    SQL = `
      INSERT INTO categories(name) VALUES('SQL');
      INSERT INTO categories(name) VALUES('Express');
      INSERT INTO categories(name) VALUES('Shopping');
      INSERT INTO notes(txt, ranking, category_id) VALUES('learn express', 5, (SELECT id FROM categories WHERE name='Express'));
      INSERT INTO notes(txt, ranking, category_id) VALUES('add logging middleware', 5, (SELECT id FROM categories WHERE name='Express'));
      INSERT INTO notes(txt, ranking, category_id) VALUES('write SQL queries', 4, (SELECT id FROM categories WHERE name='SQL'));
      INSERT INTO notes(txt, ranking, category_id) VALUES('learn about foreign keys', 4, (SELECT id FROM categories WHERE name='SQL'));
      INSERT INTO notes(txt, ranking, category_id) VALUES('buy a quart of milk', 2, (SELECT id FROM categories WHERE name='Shopping'));
    `;
    await client.query(SQL);
    console.log('Data seeded');

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
