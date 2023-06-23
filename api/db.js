// db.js
const mysql = require('mysql');

let db;

function handleDisconnect() {
    db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'popcorn'
    });

    db.connect(function(err) {
        if(err) {
            console.error('Erreur lors de la connexion à la bdd, nouvelle tentative dans 3s ...');
            setTimeout(handleDisconnect, 3000);
        }
    });

    db.on('error', function(err) {
        console.error('Erreur lors de la nouvelle connexion à la bdd, nouvelle tentative dans 3s ...');
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();

module.exports = db;
