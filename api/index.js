// main.js
const express = require('express'); // Importe le module express
const cors = require('cors'); // Importe le module CORS (Cross Origin Resource Sharing)
const bcrypt = require('bcrypt'); // Importe le module bcrypt pour le hachage de mot de passe
const jwt = require('jsonwebtoken'); // Importe le module jsonwebtoken pour la gestion des tokens JWT (JSON Web Tokens)
const {v4: uuid} = require('uuid'); // Importe le module uuid pour la génération des UUID
const db = require('./db'); // Importe le module de base de données

const app = express(); // Initialise une nouvelle application express
const saltRounds = 10; // Définit le nombre de tours pour le hachage du mot de passe

// Middleware pour l'authentification avec JWT
const authenticateJWT = (req, res, next) => {
    // Si la requête est une requête OPTIONS (utilisée pour la vérification de CORS), passer au prochain middleware
    if (req.method === 'OPTIONS') {
        return next();
    }

    // Récupère le header d'autorisation de la requête
    const authHeader = req.headers.authorization;
    // Définit les routes qui ne nécessitent pas d'authentification
    const whitelist = ['/register', '/login', '/machine/check'];

    // Si la route de la requête est dans la liste blanche, passer au prochain middleware
    if (whitelist.includes(req.path)) {
        return next();
    }

    // Si le header d'autorisation existe
    if (authHeader) {
        // Récupère le token JWT du header d'autorisation
        const token = authHeader.split(' ')[1];

        // Vérifie le token JWT
        jwt.verify(token, 'popcorn_iot', (err, user) => {
            // Si une erreur est levée pendant la vérification, renvoie un statut 403
            if (err) {
                return res.sendStatus(403);
            }

            // Si la vérification est réussie, ajoute l'utilisateur au requête et passe au prochain middleware
            req.user = user;
            next();
        });
    } else {
        // Si le header d'autorisation n'existe pas, renvoie un statut 401
        res.sendStatus(401);
    }
};

// Applique le middleware d'authentification à toutes les routes
app.use(authenticateJWT);

// Définit les options pour le middleware CORS
const corsOptions = {
    origin: '*', // Autorise toutes les origines
    optionsSuccessStatus: 200, // Renvoie un statut 200 pour les requêtes OPTIONS
    methods: "GET, HEAD, PUT, PATCH, POST, DELETE", // Autorise ces méthodes HTTP
    allowedHeaders: ["Content-Type", "Authorization", "skipAuth"], // Autorise ces en-têtes
    credentials: true, // Autorise les requêtes avec des credentials (ex : cookies)
}

// Applique le middleware CORS avec les options définies à toutes les routes
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Ajoute une route OPTIONS pour toutes les routes

app.use(express.json()); // Applique le middleware express.json pour parser le corps des requêtes en JSON


/* --- ENDPOINT API --- */

// POST /register - Enregistrement d'un nouvel utilisateur
app.post('/register', async (req, res) => {
    // On exécute une requête pour chercher un utilisateur qui aurait le même email dans la base de données.
    db.query('SELECT * FROM user WHERE email = ?', [req.body.email], async (err, results) => {
        if (err) throw res.status(500).send('Server error'); // Si une erreur survient lors de l'exécution de la requête, on la renvoie.

        const user = results[0]; // Le résultat est un tableau d'utilisateurs, on prend le premier.

        if (user) {
            // Si un utilisateur est trouvé, cela signifie qu'il existe déjà un utilisateur avec le même email.
            // On renvoie alors une erreur indiquant que l'email est déjà utilisé.
            res.status(409).send("L'adresse e-mail est déjà utilisée. Veuillez en utiliser une autre.");
        } else {
            // Si aucun utilisateur n'est trouvé, on peut procéder à la création de l'utilisateur.
            // On crée un nouvel utilisateur avec les données fournies dans le corps de la requête et un mot de passe haché.
            let user = {
                id: uuid(),
                prenom: req.body.prenom,
                nom: req.body.nom,
                email: req.body.email,
                password: await bcrypt.hash(req.body.password, saltRounds) // Le mot de passe est haché pour des raisons de sécurité.
            }

            // On insère le nouvel utilisateur dans la base de données.
            db.query('INSERT INTO user SET ?', user, (err, result) => {
                if (err) throw res.status(500).send('Server error'); // Si une erreur survient lors de l'insertion, on la renvoie.
                // En cas de succès, on renvoie l'utilisateur créé.
                res.status(201).json({id: user.id, prenom: user.prenom, nom: user.nom, email: user.email});
            });
        }
    });
});

// POST /login - Connexion de l'utilisateur
app.post('/login', (req, res) => {
    // On exécute une requête pour chercher un utilisateur avec l'email fourni dans la base de données.
    db.query('SELECT * FROM user WHERE email = ?', [req.body.email], async (err, results) => {
        if (err) throw res.status(500).send('Server error'); // Si une erreur survient lors de l'exécution de la requête, on la renvoie.

        const user = results[0]; // Le résultat est un tableau d'utilisateurs, on prend le premier.

        if (user !== undefined) {
            // Si un utilisateur est trouvé, on compare le mot de passe fourni avec le mot de passe haché stocké dans la base de données.
            const match = await bcrypt.compare(req.body.password, user.password);

            if (match) {
                // Si les mots de passe correspondent, on crée un token JWT et on le renvoie.
                const token = jwt.sign({id: user.id}, 'popcorn_iot', {expiresIn: '1h'});
                res.json({id: user.id, token: token});

                return;
            } else {
                // Si les mots de passe ne correspondent pas, on renvoie une erreur indiquant que l'email ou le mot de passe est incorrect.
                res.status(401).send('Email ou mot de passe incorrect');
            }
        } else {
            // Si aucun utilisateur n'est trouvé, on renvoie une erreur indiquant que l'email ou le mot de passe est incorrect.
            res.status(401).send('Email ou mot de passe incorrect');
        }
    });
});

// POST /abonnement/:userId - Création d'un abonnement pour un utilisateur
app.post('/abonnement/:userId', async (req, res) => {
    const userId = req.params.userId; // On récupère l'identifiant de l'utilisateur à partir des paramètres de l'URL.

    try {
        // On récupère l'utilisateur avec l'identifiant fourni.
        let user = await getUser(userId);

        if (user !== undefined) {
            // Si l'utilisateur existe, on crée un nouvel abonnement pour cet utilisateur.
            let currentDateTime = new Date();

            let abonnement = {
                id: uuid(),
                user: user.id,
                nb_utilisations_restantes: 0,
                updated_at: currentDateTime,
                created_at: currentDateTime
            }

            // On insère le nouvel abonnement dans la base de données.
            db.query('INSERT INTO abonnement SET ?', abonnement, (err, result) => {
                if (err) throw err; // Si une erreur survient lors de l'insertion, on la renvoie.
                // En cas de succès, on renvoie l'abonnement créé.
                res.status(201).json({id: abonnement.id});
            });
        } else {
            // Si l'utilisateur n'existe pas, on renvoie une erreur indiquant que la création de l'abonnement est impossible.
            res.status(401).send("Création de l'abonnement impossible !");
        }
    } catch (error) {
        // Si une erreur survient lors de la récupération de l'utilisateur, on la renvoie.
        res.status(500).send('Server error');
    }
});

// GET /abonnement/:id - Récupération d'un abonnement par son ID
app.get('/abonnement/:id', (req, res) => {
    // On exécute une requête pour récupérer l'abonnement avec l'ID spécifié dans la base de données.
    db.query('SELECT * FROM abonnement WHERE id = ?', [req.params.id], (err, results) => {
        if (err) throw res.status(500).send('Server error'); // Si une erreur survient lors de l'exécution de la requête, on la renvoie.
        // On renvoie le nombre d'utilisations restantes de l'abonnement.
        res.status(201).json({nbUtilisationsRestantes: results[0].nb_utilisations_restantes});
    });
});

// PUT /abonnement/:id - Mise à jour d'un abonnement par son ID
app.put('/abonnement/:id', (req, res) => {
    // On crée un objet contenant les informations mises à jour de l'abonnement.
    const updatedAbonnement = {
        nb_utilisations_restantes: req.body.nbUtilisationsRestantes, // Le nombre d'utilisations restantes est récupéré du corps de la requête.
        updated_at: new Date(), // On met à jour la date de dernière mise à jour.
    };

    // On exécute une requête pour mettre à jour l'abonnement dans la base de données.
    db.query('UPDATE abonnement SET ? WHERE id = ?', [updatedAbonnement, req.params.id], (err, result) => {
        if (err) throw res.status(500).send('Server error'); // Si une erreur survient lors de l'exécution de la requête, on la renvoie.
        // On renvoie l'abonnement mis à jour.
        res.json(updatedAbonnement);
    });
});

// DELETE /abonnement/:id - Suppression d'un abonnement par son ID
app.delete('/abonnement/:id', (req, res) => {
    // On exécute une requête pour supprimer l'abonnement avec l'ID spécifié de la base de données.
    db.query('DELETE FROM abonnement WHERE id = ?', [req.params.id], (err, result) => {
        if (err) throw res.status(500).send('Server error'); // Si une erreur survient lors de l'exécution de la requête, on la renvoie.
        // On renvoie un code 204 (No Content) pour indiquer que la suppression a été effectuée avec succès.
        res.status(204).send();
    });
});

// GET /user - Récupération de tous les utilisateurs
app.get('/user', (req, res) => {
    // On exécute une requête pour récupérer tous les utilisateurs dans la base de données.
    db.query('SELECT * FROM user', (err, results) => {
        if (err) throw res.status(500).send('Server error'); // Si une erreur survient lors de l'exécution de la requête, on la renvoie.
        // On renvoie les utilisateurs récupérés.
        res.json(results);
    });
});

// GET /user/:id - Récupération d'un utilisateur par son ID
app.get('/user/:id', (req, res) => {
    // On exécute une requête pour récupérer l'utilisateur avec l'ID spécifié dans la base de données.
    db.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, results) => {
        if (err) throw res.status(500).send('Server error'); // Si une erreur survient lors de l'exécution de la requête, on la renvoie.
        // On renvoie l'utilisateur récupéré.
        res.status(201).json({id: results[0].id, prenom: results[0].prenom, nom: results[0].nom});
    });
});

// GET /user/:id/abonnement - Récupération de l'abonnement d'un utilisateur par son ID
app.get('/user/:id/abonnement', (req, res) => {
    // On exécute une requête pour récupérer l'abonnement associé à l'utilisateur avec l'ID spécifié dans la base de données.
    db.query('SELECT * FROM abonnement WHERE user = ?', [req.params.id], (err, results) => {
        if (err) throw res.status(500).send('Server error'); // Si une erreur survient lors de l'exécution de la requête, on la renvoie.

        // Si l'utilisateur a au moins un abonnement, on renvoie le premier.
        if (results.length > 0) {
            res.status(201).json({id: results[0].id, nbUtilisationsRestantes: results[0].nb_utilisations_restantes});
        } else {
            // Si l'utilisateur n'a pas d'abonnement, on renvoie un message d'erreur.
            res.status(401).send("Aucun abonnement associé à cette utilisateur");
        }
    });
});

// POST /machine/check - Vérification de l'utilisateur et de son abonnement
app.post('/machine/check', async (req, res) => {
    // On récupère l'ID de l'utilisateur à partir du corps de la requête
    const userId = req.body.id;

    try {
        // On tente de récupérer l'utilisateur avec l'ID donné
        let user = await getUser(userId);

        // Si l'utilisateur existe
        if (user !== undefined) {
            // On tente de récupérer l'abonnement de l'utilisateur
            let abonnement = await getAbonnementOfUser(userId);

            // Si l'abonnement existe
            if (abonnement !== undefined) {
                // On génère un token JWT pour l'utilisateur qui expire dans 1 heure
                const token = jwt.sign({id: user.id}, 'popcorn_iot', {expiresIn: '1h'});
                // On renvoie les informations de l'utilisateur, de l'abonnement, le nombre d'utilisations restantes et le token généré
                res.status(201).json({nom: user.prenom, abonnement: abonnement.id, nombreRestanteUtilisation: abonnement.nb_utilisations_restantes, token: token});
            } else {
                // Si l'abonnement n'existe pas, on renvoie un message d'erreur
                res.status(401).send("Action impossible !");
            }
        } else {
            // Si l'utilisateur n'existe pas, on renvoie un message d'erreur
            res.status(401).send("Action impossible !");
        }
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// POST /machine/use - Utilisation de la machine par un utilisateur avec un abonnement
app.post('/machine/use', async (req, res) => {
    // On récupère l'ID de l'abonnement à partir du corps de la requête
    const abonnementId = req.body.id;

    try {
        // On prépare l'objet de mise à jour avec le nouveau nombre d'utilisations restantes (diminué de 1) et la date de mise à jour
        const updatedAbonnement = {
            nb_utilisations_restantes: req.body.nbUtilisationsRestantes - 1,
            updated_at: new Date(),
        };

        // On exécute une requête pour mettre à jour l'abonnement avec l'ID spécifié dans la base de données
        db.query('UPDATE abonnement SET ? WHERE id = ?', [updatedAbonnement, abonnementId], (err, result) => {
            if (err) throw res.status(500).send('Server error');
            // Si la mise à jour est réussie, on renvoie un objet avec une propriété status définie sur true
            res.status(201).json({status: true});
        });
    } catch (error) {
        res.status(500).send('Server error');
    }
});

/* --- FONCTION --- */

// Fonction qui renvoie une promesse qui se résout avec l'utilisateur correspondant à l'ID spécifié
const getUser = (id) => {
    return new Promise((resolve, reject) => {
        // Exécution d'une requête SQL pour récupérer un utilisateur à partir de son ID
        db.query('SELECT * FROM user WHERE id = ?', [id], (err, results) => {
            // Si une erreur se produit lors de l'exécution de la requête, la promesse est rejetée avec l'erreur
            if (err) {
                reject(err);
                return;
            }
            // Si tout se passe bien, la promesse est résolue avec le premier utilisateur (et normalement unique) correspondant à l'ID
            resolve(results[0]);
        });
    });
}

// Fonction qui renvoie une promesse qui se résout avec l'abonnement d'un utilisateur spécifié par son ID
const getAbonnementOfUser = (id) => {
    return new Promise((resolve, reject) => {
        // Exécution d'une requête SQL pour récupérer l'abonnement d'un utilisateur à partir de son ID
        db.query('SELECT * FROM abonnement WHERE user = ?', [id], (err, results) => {
            // Si une erreur se produit lors de l'exécution de la requête, la promesse est rejetée avec l'erreur
            if (err) {
                reject(err);
                return;
            }
            // Si tout se passe bien, la promesse est résolue avec le premier (et normalement unique) abonnement de l'utilisateur correspondant à l'ID
            resolve(results[0]);
        });
    });
}

// Démarrage du serveur sur le port 3000
app.listen(3000, () => console.log("API Server is running ..."))
