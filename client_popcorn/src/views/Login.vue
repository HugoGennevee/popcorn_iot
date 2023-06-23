<template>
    <div id="app" class="container py-5 full-screen">
        <div class="card mx-auto kiosk-card">
            <div class="card-body">
                <div class="d-flex justify-content-center">
                    <img src="../assets/popcorn.jpg" class="img-fluid w-25 my-4" alt="Popcorn"/>
                </div>

                <h1 class="card-title text-center text-primary">Cinéma Gaumont</h1>

                <h2 class="mt-4 text-center">Veuillez vous identifier</h2>

                <div class="mb-3">
                    <label for="email" class="form-label">Adresse email :</label>
                    <input type="email" class="form-control" id="email" v-model="email">
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Mot de passe :</label>
                    <input type="password" class="form-control" id="password" v-model="password">
                </div>

                <div class="row">
                    <div class="col text-center">
                        <button type="submit" class="btn btn-primary w-50" v-on:click="login">Connexion</button>
                    </div>
                </div>

                <div class="row mt-2">
                    <div class="col text-center">
                        <button class="btn" v-on:click="moveToRegisterPage"><a class="text-primary fa-italic fa-underline">Nouveau compte</a></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// Importation du module axios pour réaliser des requêtes HTTP
import axios from 'axios';

export default {
    // Initialisation des données du composant
    data() {
        return {
            email: null, // Adresse e-mail entrée par l'utilisateur
            password: null, // Mot de passe entré par l'utilisateur
        }
    },
    methods: {
        // Méthode pour gérer la connexion de l'utilisateur
        login() {
            let that = this; // Référence à l'instance actuelle du composant
            let responseResult = null; // Résultat de la requête HTTP

            // Envoi d'une requête HTTP POST au serveur pour se connecter
            axios.post('http://localhost:3000/login', {
                email: this.email, // Envoi de l'adresse e-mail
                password: this.password // Envoi du mot de passe
            }, {headers: { skipAuth: true }})
                .then(function (response) {
                    // Si la requête a réussi, sauvegarde du résultat
                    responseResult = response.data;
                })
                .catch(function (error) {
                    // Gestion des erreurs
                })
                .finally(function () {
                    // Après la requête, qu'elle ait réussi ou non
                    if (responseResult !== null) {
                        // Si la requête a réussi, sauvegarde du token dans le local storage
                        localStorage.setItem('token', responseResult.token);
                        // Et redirection vers la page d'abonnement
                        that.$router.push({name: 'abonnement', params: {userId: responseResult.id}});
                    } else {
                        // Si la requête a échoué, affichage d'un message d'erreur
                        alert('Information de connexion incorrecte !')
                    }
                });
        },
        // Méthode pour rediriger l'utilisateur vers la page d'inscription
        moveToRegisterPage() {
            this.$router.push('/register');
        }
    }
}
</script>

<style scoped>

.kiosk-card {
    max-width: 600px;
    background: #f8f9fa;
    border-radius: 20px;
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
}

#barcode-scanner {
    width: 100%;
    height: 300px;
    overflow: hidden;
    position: relative;
}

#barcode-scanner video {
    max-width: 100%;
    max-height: 100%;
}

.center-button {
    display: flex;
    justify-content: center;
    margin-top: 10px;
    margin-bottom: 10px;
}
</style>
