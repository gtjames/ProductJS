var express = require('express');
var router = express.Router();
//  this is the package for working with the file system
const fs = require('fs')

//  arrays of people on the ship and the title of the columns
let titanic = [],
    headers = [];

//      Show the home page without data
router.get('/', function (req, res, next) {
    res.render('titanic/passengers', {
        passengers: [],         //  no passengers will be listed
        headers: headers,       //  lets show the headers though
        search: ''              //  leave the search field empty
    });
});

//      List all passengers
router.get('/all', function (req, res, next) {
    //  the reduce function can be used to count
    //   we need to add one to the alive count if passenger is a survivor
    let alive = list.reduce((total, p) => total + (p.survivor?1:0),0)       //  count the survivors
    //  we need to add one to the dead cound if passenger is NOT (!) a survivor
    let dead  = list.reduce((total, p) => total +(!p.survivor?1:0),0)       //  count the dead

    //  render the passengers page, which is in the views/titanic folder
    res.render('titanic/passengers', {
        passengers:     titanic,    //  show all passengers
        headers:        headers,    //  show the headers
        search:         '',         //  leave search field blank
        survivors:      alive,      //  survivors count
        notSurvivors:   dead        //  the honored dead
    });
});

//      From the URL pass in the name of a passenger to search for
router.get('/name/:name', function (req, res, next) {
    //  When data comes from the URL it is passed in req.params._________
    //      http://localhost:3000/titanic/name/Henry
    let name = req.params.name;

    //  filter out all passengers/crew whose name includes the value in the name variable
    let list = titanic.filter(p => p.name.includes(name));

    //  count the living and the dead
    let alive = list.reduce((total, p) => total + (p.survivor?1:0),0);      //  count the survivors
    let dead  = list.reduce((total, p) => total +(!p.survivor?1:0),0);      //  count the dead
    res.render('titanic/passengers', {
        passengers:     list,       //  show all passengers
        headers:        headers,    //  show the headers
        search:         '',         //  leave search field blank
        survivors:      alive,      //  survivors count
        notSurvivors:   dead        //  the honored dead
    });
});

//      List the found travellers for any kind of search
router.post('/search', function (req, res, next) {
    //  the search field has evolved to have multiple search requests
    //  for instance            Will find:
    //  first:Henry             passengers with first name that include Henry
    //  first:Henry:surv:       passengers named Henry the survived
    //  crew                    all crew members
    //  pax                     all passengers
    //  clas:1st:first:Henry    1st class passengers name Henry
    //  all tokens are : separated
    //  the search field can be [key : value, key : value, key : value, key : value]
    let tokens = req.body.search.split(':');

    //  list will be the list passed to the page to display our found records
    //  initialize it with all passengers
    let list = titanic;

    //  Look at the even tokens -- this will be First Name, Last Name, Class....
    for (let i = 0; i < tokens.length; i += 2) {
        //  switch on just the first 4 characters. Uppercase to standardize the text
        switch (tokens[i].toUpperCase().substring(0, 4)) {
            //  this next four case statements look for the odd numbered token
            //  to see if the desired field INCLUDES that token
            case 'FIRS':    list = list.filter(p => p.firstName.includes(tokens[i + 1])); break;
            case 'LAST':    list = list.filter(p => p.lastName.includes(tokens[i + 1]));  break;
            case 'CLAS':    list = list.filter(p => p.passengerClass.includes(tokens[i + 1])); break;
            case 'ROLE':    list = list.filter(p => p.role.includes(tokens[i + 1])); break;
            
            //  these two case statements do not have a second half of the key:value pair
            //  We just use it to look for crew or passenter in the passengerCrew field
            case 'CREW':    list = list.filter(p => p.passengerCrew == 'Crew'); break;
            case 'PAX':     list = list.filter(p => p.passengerCrew == 'Passenger'); break;

            //  Also does not have a second half of the key:value pair
            //  Just looking to see if the survivor field is true or false
            case 'SURV':    list = list.filter(p => p.survivor); break;
            case 'NOT':     list = list.filter(p => !p.survivor); break;
        }
    }

    //  let's provide some stats on the found individuals. Did they survive or not?
    let alive = list.reduce((total, p) => total + (p.survivor?1:0),0);
    let dead  = list.reduce((total, p) => total + (!p.survivor?1:0),0);

    //  finally package it all up and pass along to be displayed
    res.render('titanic/passengers', {
        passengers: list,
        headers: headers,
        search: req.body.search,
        survivors: alive,
        notSurvivors: dead
    });
});

module.exports = router;

//  The Passenger Object
class Passenger {
    constructor(Name, Age, PassengerClass, PassengerCrew, Role, Survivor) {
        this.name = Name;                       //  full name

        let temp = Name.split('/');             //  split the name on the first/last separator '/'
        this.lastName = temp[0];                //  the first token will be the last name
        if (temp.length > 1)                    //  if there is one more token
            this.firstName = temp[1];           //  it is the first name

        this.age = +Age;                        //  +Age will convert age to a number
        this.passengerClass = PassengerClass;   //  1st, 2nd, 3rd...
        this.passengerCrew = PassengerCrew;     //  'Passenger' or 'Crew'
        this.role = Role;                       //  secondary job (Delivery trip only), Servant, Musician
        this.survivor = Survivor == 'T';        //  True or False
    }
}

//  read the file like basic text
//  titanic.csv is a comma separated variable file (fields are separated by commas)
//  it is a listing of all passengers and crew from the Titanic. 
//  Including those that show up for work and those that got on just to cross over to SouthHampton
fs.readFile('/projects/csv/titanic.csv', {encoding: 'utf-8'}, (err, data) => {
    if (err) {
        console.error(err)
        return
    }

    //  The text we received is one LARGE text string
    //  each line is separated by a CR LF
    //  split the large text string into individual lines
    let lines = data.split('\r\n');

    //  grab the first row. It is the headings for the column names
    //  SHIFT the FIRST element of the array off of the passenger names array
    //  it contains the column names as a string
    //      "Last Name,First Name,Age,Class,Passenger or Crew,Role,Survivor"
    //  Split on , to get an array of the column names
    //      ['Last Name', 'First Name', 'Age', 'Class', 'Passenger or Crew', 'Role', 'Survivor']
    //  we will use them to display on the web page <th> tag in the table
    headers = lines.shift().split(',');

    //  Each line represents a passenger or crew member on the ship
    //      "BROWN/ Mrs Margaret ,44,1st Class,Passenger,,T"
    for (let line of lines) {
        //  split the line on , to get the individual attributes into an array
        //      [BROWN/ Mrs Margaret ', '44', '1st Class', 'Passenger', '', 'T']
        //      This BTW is the famous 'Molly' Brown as in the 'Unsinkable Molly Brown'
        let attributes = line.split(',');

        //  create a passenger using the data from the text file
        //                         Name,          Age,           Class,      Passenger or Crew, Role,        Survivor
        let person = new Passenger(attributes[0], attributes[1], attributes[2], attributes[3], attributes[4], attributes[5]);
        
        //  save each passenger and crew member to the titanic manifest
        titanic.push(person);
    }
});
