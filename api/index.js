// main.js
const express = require('express');
const cors = require('cors');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const db = require('./db');

const app = express();
const saltRounds = 10;

app.use(cors());
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
      
      // Comparaison du mot de passe avec le hash stocké dans la BDD
      const match = await bcrypt.compare(req.body.password, user.password);
      
      if (match) {
        const token = jwt.sign({ id: user.id }, 'popcorn_iot', { expiresIn: '1h' });
        res.json({token: token});
      } else {
        res.status(401).send('Email ou mot de passe incorrect');
      }
    });
});

app.post('/abonnement/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        let user = await getUser(userId);

        console.log(user);
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

app.get('/users', (req, res) => {
    db.query('SELECT * FROM user', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.post('/users', (req, res) => {
    const user = {
        id: uuid(),
        username: req.body.username,
        email: req.body.email
    };

    db.query('INSERT INTO user SET ?', user, (err, result) => {
        if (err) throw err;
        res.status(201).json(user);
    });
});

app.get('/users/:id', (req, res) => {
    db.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, results) => {
        if (err) throw err;
        res.json(results[0]);
    });
});

app.put('/users/:id', (req, res) => {
    const updatedUser = {
        username: req.body.username,
        email: req.body.email
    };

    db.query('UPDATE user SET ? WHERE id = ?', [updatedUser, req.params.id], (err, result) => {
        if (err) throw err;
        res.json(updatedUser);
    });
});

app.delete('/users/:id', (req, res) => {
    db.query('DELETE FROM user WHERE id = ?', [req.params.id], (err, result) => {
        if (err) throw err;
        res.status(204).send();
    });
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

app.listen(3000, () => console.log("API Server is running ..."))
