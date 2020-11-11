const fs = require('fs');
const path = require('path');
const express = require('express');
const PORT = process.env.PORT || 3001; // sets an environment variable
const app = express();
// parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON data
app.use(express.json());
const { animals } = require('./data/animals');



function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];

    // note that animalsArray is left as filteredResults
    let filteredResults = animalsArray;

    // set conditions for personality due to personalityTraits containing array in json
    if (query.personalityTraits) {
        // Save personalityTraits as a dedicated array.
        // If personalityTraits is a string, place it into a new array and save
        if (typeof query.personalityTraits === 'string') {
            personalityTraitsArray = [query.personalityTraits];
        } else {
            personalityTraitsArray = query.personalityTraits;
        }
        // Loop through each trait in the personalityTraits array:
        personalityTraitsArray.forEach(trait => {
            // Check the trait against each animal in the filteredResults array.
            // Remember, it is initially a copy of the animalsArray,
            // but here we're updating it for each trait in the .forEach() loop.
            // For each trait being targeted by the filter, the filteredResults
            // array will then contain only the entries that contain the trait,
            // so at the end we'll have an array of animals that have every one 
            // of the traits when the .forEach() loop is finished.
            filteredResults = filteredResults.filter(
                animals => animals.personalityTraits.indexOf(trait) !== -1
            );
        });
    }
    if (query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    return filteredResults;
}

function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id ===id)[0];
    return result;
}

function createNewAnimal(body, animalsArray) {
    // create a new array
    const animal = body;
    animalsArray.push(animal);

    // write data to animals.json file
    fs.writeFileSync(
        path.join(__dirname, './data/animals.json'),
        JSON.stringify({ animals: animalsArray }, null, 2)
    );

    // return finished code to post route for response
    return animal;
}

// function to check if each key exists or contains the right type of data
function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
      return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
      return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
      return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
      return false;
    }
    return true;
  };

// create a GET route for a query search
app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
})

// create a GET route by id (returns a single object)
app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    // return 404 code if no record exists
    if (result) {
        res.json(result);
    } else {
        res.send(404);
    }
});

// method that listens for POST requests(client requesting server to accept data)
app.post('/api/animals', (req, res) => {
    // set id based on what the next index of the array will be
    req.body.id = animals.length.toString();

    // if any data in req.body is incorect, send 400 error back
    if (!validateAnimal(req.body)) {
        res.status(400).send('The animal is not properly formatted.');
    }else {
        // add animal to json file and animals array in this function
        const animal = createNewAnimal(req.body, animals);
    
        // req.body is where our incoming content will be
        res.json(req.body);
    }
});


app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});