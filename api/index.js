// main.js
const express = require('express');
const cors = require('cors');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {v4: uuid} = require('uuid');
const db = require('./db');

const app = express();
const saltRounds = 10;

const authenticateJWT = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }

    const authHeader = req.headers.authorization;
    const whitelist = ['/register', '/login', '/machine/check'];

    if (whitelist.includes(req.path)) {
        return next();
    }

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, 'popcorn_iot', (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

app.use(authenticateJWT);

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
    methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
    allowedHeaders: ["Content-Type", "Authorization", "skipAuth"],
    credentials: true,
}

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

/* --- ENDPOINT API --- */

app.post('/register', async (req, res) => {
    let user = {
        id: uuid(),
        prenom: req.body.prenom,
        nom: req.body.nom,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, saltRounds) // Hash du mot de passe
    }

    db.query('INSERT INTO user SET ?', user, (err, result) => {
        if (err) throw err;
        res.status(201).json({id: user.id, prenom: user.prenom, nom: user.nom, email: user.email});
    });
});

app.post('/login', (req, res) => {
    db.query('SELECT * FROM user WHERE email = ?', [req.body.email], async (err, results) => {
        if (err) throw err;
        const user = results[0];

        if (user !== undefined) {
            const match = await bcrypt.compare(req.body.password, user.password);

            if (match) {
                const token = jwt.sign({id: user.id}, 'popcorn_iot', {expiresIn: '1h'});
                res.json({id: user.id, token: token});

                return;
            } else {
                res.status(401).send('Email ou mot de passe incorrect');
            }
        } else {
            res.status(401).send('Email ou mot de passe incorrect');
        }
    });
});

app.post('/abonnement/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        let user = await getUser(userId);

        if (user !== undefined) {
            let currentDateTime = new Date();

            let abonnement = {
                id: uuid(),
                user: user.id,
                nb_utilisations_restantes: 0,
                updated_at: currentDateTime,
                created_at: currentDateTime
            }

            db.query('INSERT INTO abonnement SET ?', abonnement, (err, result) => {
                if (err) throw err;
                res.status(201).json({id: abonnement.id});
            });
        } else {
            res.status(401).send("Création de l'abonnement impossible !");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
});

app.get('/abonnement/:id', (req, res) => {
    db.query('SELECT * FROM abonnement WHERE id = ?', [req.params.id], (err, results) => {
        if (err) throw err;
        res.status(201).json({nbUtilisationsRestantes: results[0].nb_utilisations_restantes});
    });
});

app.put('/abonnement/:id', (req, res) => {
    const updatedAbonnement = {
        nb_utilisations_restantes: req.body.nbUtilisationsRestantes,
        updated_at: new Date(),
    };

    db.query('UPDATE abonnement SET ? WHERE id = ?', [updatedAbonnement, req.params.id], (err, result) => {
        if (err) throw err;
        res.json(updatedAbonnement);
    });
});

app.delete('/abonnement/:id', (req, res) => {
    db.query('DELETE FROM abonnement WHERE id = ?', [req.params.id], (err, result) => {
        if (err) throw err;
        res.status(204).send();
    });
});

app.get('/user', (req, res) => {
    db.query('SELECT * FROM user', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.get('/user/:id', (req, res) => {
    db.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, results) => {
        if (err) throw err;
        res.status(201).json({id: results[0].id, prenom: results[0].prenom, nom: results[0].nom});
    });
});

app.get('/user/:id/abonnement', (req, res) => {
    db.query('SELECT * FROM abonnement WHERE user = ?', [req.params.id], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.status(201).json({id: results[0].id, nbUtilisationsRestantes: results[0].nb_utilisations_restantes});
        } else {
            res.status(401).send("Aucun abonnement associé à cette utilisateur");
        }
    });
});

app.post('/machine/check', async (req, res) => {
    const userId = req.body.id;

    try {
        let user = await getUser(userId);

        if (user !== undefined) {
            let abonnement = await getAbonnementOfUser(userId);

            if (abonnement !== undefined) {
                const token = jwt.sign({id: user.id}, 'popcorn_iot', {expiresIn: '1h'});
                res.status(201).json({nom: user.prenom, abonnement: abonnement.id, nombreRestanteUtilisation: abonnement.nb_utilisations_restantes, token: token});
            } else {
                res.status(401).send("Action impossible !");
            }
        } else {
            res.status(401).send("Action impossible !");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
});

app.post('/machine/use', async (req, res) => {
    const abonnementId = req.body.id;

    try {
        const updatedAbonnement = {
            nb_utilisations_restantes: req.body.nbUtilisationsRestantes - 1,
            updated_at: new Date(),
        };

        db.query('UPDATE abonnement SET ? WHERE id = ?', [updatedAbonnement, abonnementId], (err, result) => {
            if (err) throw res.status(500).send('Server error');
            res.status(201).json({status: true});
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
});

/* --- FONCTION --- */

const getUser = (id) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM user WHERE id = ?', [id], (err, results) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(results[0]);
        });
    });
}

const getAbonnementOfUser = (id) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM abonnement WHERE user = ?', [id], (err, results) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(results[0]);
        });
    });
}

app.listen(3000, () => console.log("API Server is running ..."))
