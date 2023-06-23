// Importation du module mysql pour gérer la connexion à la base de données
const mysql = require('mysql');

// Initialisation de la variable de connexion à la base de données
let db;

// Fonction pour gérer les déconnexions et reconnecter au besoin
function handleDisconnect() {
    // Création de la connexion à la base de données
    db = mysql.createConnection({
        host: 'localhost', // L'hôte de la base de données (ici, il s'agit du même serveur)
        user: 'root', // Le nom d'utilisateur pour se connecter à la base de données
        password: '', // Le mot de passe pour se connecter à la base de données
        database: 'popcorn' // Le nom de la base de données à laquelle se connecter
    });

    // Tentative de connexion à la base de données
    db.connect(function(err) {
        if(err) {
            // En cas d'erreur lors de la connexion, on affiche un message d'erreur et on tente de se reconnecter après 3 secondes
            console.error('Erreur lors de la connexion à la bdd, nouvelle tentative dans 3s ...');
            setTimeout(handleDisconnect, 3000);
        }
    });

    // Écoute des erreurs sur la connexion à la base de données
    db.on('error', function(err) {
        // En cas d'erreur, on affiche un message d'erreur et on tente de se reconnecter si l'erreur est due à une perte de connexion
        console.error('Erreur lors de la nouvelle connexion à la bdd, nouvelle tentative dans 3s ...');
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            // Si l'erreur n'est pas due à une perte de connexion, on la relance
            throw err;
        }
    });
}

// Initialisation de la connexion à la base de données
handleDisconnect();

// Exportation de la connexion à la base de données pour pouvoir l'utiliser dans d'autres modules
module.exports = db;
