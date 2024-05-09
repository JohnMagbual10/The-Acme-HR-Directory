const express = require('express');
const pg = require('pg');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost/acme_hr_directory_db';
const client = new pg.Client({ connectionString: DATABASE_URL });

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// Define your routes here

const init = async () => {
    try {
      // Connect to the database
      await client.connect();
      console.log('Connected to the database');
  
      // Initialize database tables
      let SQL = `
        DROP TABLE IF EXISTS notes;
        DROP TABLE IF EXISTS categories;
      `;
      await client.query(SQL);
  
      // Create categories table
      SQL = `
        CREATE TABLE categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL
        );
      `;
      await client.query(SQL);
      console.log('Created categories table');
  
      // Create notes table
      SQL = `
        CREATE TABLE notes (
          id SERIAL PRIMARY KEY,
          name TEXT,
          txt TEXT,
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now(),
          ranking INTEGER DEFAULT 3 NOT NULL,
          category_id INTEGER NOT NULL,
          FOREIGN KEY (category_id) REFERENCES categories(id)
        );
      `;
      await client.query(SQL);
      console.log('Created notes table');
  
      // Seed categories data
      SQL = `
        INSERT INTO categories (name) VALUES 
        ('Technology'), 
        ('Finance'), 
        ('Human Resources');
      `;
      await client.query(SQL);
      console.log('Seeded categories data');
  
      // Seed notes data
      SQL = `
        INSERT INTO notes (name, txt, category_id) VALUES 
        ('Note 1', 'Lorem ipsum dolor sit amet', (SELECT id FROM categories WHERE name = 'Technology')),
        ('Note 2', 'Consectetur adipiscing elit', (SELECT id FROM categories WHERE name = 'Finance')),
        ('Note 3', 'Sed do eiusmod tempor incididunt', (SELECT id FROM categories WHERE name = 'Human Resources'));
      `;
      await client.query(SQL);
      console.log('Seeded notes data');
  
      // Start the server
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
    } catch (error) {
      console.error('Error initializing server:', error);
      process.exit(1); // Exit with non-zero status code to indicate failure
    }
  };
  
  init();
  
  

init();
