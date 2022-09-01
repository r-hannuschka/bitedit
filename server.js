const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// sendFile will go here
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.use('/js', express.static( __dirname + '/js'));
app.use('/css', express.static( __dirname + '/css'));
app.use('/img', express.static( __dirname + '/img'));
app.use('/files', express.static( __dirname + '/files'));

app.listen(port);
console.log('Server started at http://localhost:' + port);
