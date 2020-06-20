const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, '../../')));

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

const noteList = compileInitialNoteList();

// Home page HTML route
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../../index.html'));
});

// Notes page HTML route
app.get('/notes', function(req, res) {
    res.sendFile(path.join(__dirname, '../../notes.html'));
});

// Load contents of db.json as note list upon starting the application
function compileInitialNoteList(){
    var loadNotes = fs.readFileSync(path.join(__dirname, "../../../db/db.json"), "utf-8");
    if(loadNotes){
        var parsedInput = JSON.parse(loadNotes);
        return parsedInput;
    } else {
        // If there are no saved notes, start with an empty array
        return [];
    }
}

// Get all notes
app.get("/api/notes", function(req, res) {
    res.send(noteList)
});
  
// Post new notes to backend to store new notes and for index.js to display
app.post( "/api/notes", function( req, res ){
    const newNote = req.body;
    noteList.push(newNote);
    var noteToSave = JSON.stringify(noteList);
    fs.writeFile(path.join(__dirname, "../../../db/db.json"), noteToSave, function (err) {
        if(err){
            res.send({status: false, message: "Error"});
        } else {
            res.send({status: true, message: `New note will be saved`, note: newNote});
        }
    });
    
})

// Delete notes and update db.json
app.delete("/api/notes/:id", function(req, res){
    var chosenNote = req.params.id;
    var toDelete = noteList.findIndex(note => note.id == chosenNote)
    noteList.splice(toDelete, 1);
    var noteToSave = JSON.stringify(noteList);
    fs.writeFile(path.join(__dirname, "../../../db/db.json"), noteToSave, function (err) {
        if(err){
            res.send({status: false, message: "Error"});
        } else {
            res.send({status: true, message: `Note successfully deleted`});
        }
    });
})

// Listener
app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});