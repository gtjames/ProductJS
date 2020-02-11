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
    //  we need to add one to the alive count if passenger is a survivor
    //  If the passenger survivied add one to the total
    let alive = 0;          //  TODO --- count the survivors
    //  we need to add one to the dead cound if passenger is NOT (!) a survivor
    let dead  = 0;          //  TODO --- count the dead

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
router.post('/____TODO add endpoint here____', function (req, res, next) {
    let search = '';            //  TODO --- where will you find the search text from the browser?
    let list;                   //  this will be the variable that holds the results of your search
    //  filter out all passengers/crew whose name includes the value in the name variable
    //          TODO --- your code goes here

    //  TODO --- count the living and the dead
    let alive = 0;       //  count the survivors
    let dead  = 0;       //  count the dead

    //  we will render the passengers page with the following data
    //      search the passengers.pug file for any references to data
    //      you will see some tags using the #{dataField} reference.
    //      that means you need to add to the JSON data an attribute called dataField:'some kind of data'
    res.render('titanic/passengers', {
        //      TODO this is where you will add your data
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
