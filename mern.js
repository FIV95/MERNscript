#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');
const child_process = require('child_process');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Please enter the name of your new project: ', (projectName) => {
    fs.mkdirSync(projectName);
    process.chdir(projectName);
    fs.mkdirSync('client');
    process.chdir('client');

    console.log('Setting up a new React application...');
    child_process.execSync('npx create-vite@latest . --template react', { stdio: 'inherit' });

    console.log('Installing dependencies...');
    child_process.execSync('npm install', { stdio: 'inherit' });

    console.log('Removing the public directory...');
    fs.rmSync('public', { recursive: true, force: true });

    console.log('Removing the assets directory...');
    fs.rmSync('src/assets', { recursive: true, force: true });

    process.chdir('src');

    console.log('Removing App.css and index.css...');
    fs.unlinkSync('App.css');
    fs.unlinkSync('index.css');

    console.log('Creating components directory...');
    fs.mkdirSync('components');

    console.log('Updating App.jsx...');
    let appCode = `import { useState, useEffect } from 'react';
import {Link, Routes, Route, useParams} from "react-router-dom";

function App()
{

}

export default App;
    `;
    fs.writeFileSync('App.jsx', appCode);

    console.log('Updating main.jsx...');
    let mainCode = `import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import {BrowserRouter} from 'react-router-dom';

    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>,
    );
    `;
    fs.writeFileSync('main.jsx', mainCode);

    process.chdir('..');
    process.chdir('..');

    fs.mkdirSync('server');
    process.chdir('server');

    fs.mkdirSync('config');
    fs.mkdirSync('controllers');
    fs.mkdirSync('models');
    fs.mkdirSync('routes');

    console.log('Creating a new package.json file...');
    child_process.execSync('npm init -y', { stdio: 'inherit' });

    console.log('Installing Express and Mongoose and dotenv...');
    child_process.execSync('npm install express mongoose dotenv', { stdio: 'inherit' });
    child_process.execSync('npm install nodemon --save-dev', { stdio: 'inherit' });

    console.log('Updating scripts in package.json...');
    const packageJson = JSON.parse(fs.readFileSync('package.json'));
    packageJson.scripts.start = 'nodemon server.js';
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

        console.log('Adding code to server.js...');
    let serverCode = `require('dotenv').config();
const express = require('express');
const routes = require('./routes/routes');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);

app.listen(3001, () => console.log(\`Server running on PORT 3001\`));
`;
    fs.writeFileSync('server.js', serverCode);

    console.log(`Creating a .env file...`);
    fs.writeFileSync('./.env', 'PORT=3001\nDB=\nATLAS_USERNAME=\nATLAS_PASSWORD=\nDB_CONNECTION_STRING=\n');

    let routesCode = `const express = require('express');
const router = express.Router();
// IMPORT CONTROLLERS
module.exports = router;
`;

    fs.writeFileSync('./routes/routes.js', routesCode);

let mongooseConfigCode = `const mongoose = require('mongoose');
const dbName = process.env.DB;
const username = process.env.ATLAS_USERNAME;
const pw = process.env.ATLAS_PASSWORD;
const connectionString = process.env.DB_CONNECTION_STRING;
const uri = \`\${connectionString}\${dbName}?retryWrites=true&w=majority\`;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Established a connection to the database"))
    .catch(err => console.log("Something went wrong when connecting to the database", err));
`;

fs.writeFileSync('./config/mongoose.config.js', mongooseConfigCode);

    const gitignoreContent = `node_modules
    .env
    `;
    fs.writeFileSync('./.gitignore', gitignoreContent);

    console.log('Project setup complete!');
    rl.close();
});
