<template>
    <div id="app" class="container py-5 full-screen">
        <div class="card mx-auto kiosk-card">
            <div class="card-body">
                <div class="row">
                    <div class="col text-end">
                        <button class="btn text-white fa-bold" v-on:click="moveToLoginPage">&cross;</button>
                    </div>
                </div>

                <div class="d-flex justify-content-center">
                    <img src="../assets/popcorn.jpg" class="img-fluid w-25 my-4" alt="Popcorn"/>
                </div>

                <h1 class="card-title text-center text-primary">Cinéma Gaumont</h1>

                <h2 class="mt-4 text-center">Création d'un compte</h2>

                <div class="row">
                    <div class="col">
                        <div class="mb-3">
                            <label for="nom" class="form-label">Nom :</label>
                            <input type="text" class="form-control" id="nom" v-model="nom">
                        </div>
                    </div>
                    <div class="col">
                        <div class="mb-3">
                            <label for="prenom" class="form-label">Prénom :</label>
                            <input type="text" class="form-control" id="prenom" v-model="prenom">
                        </div>
                    </div>
                </div>
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
                        <button type="submit" class="btn btn-primary w-50" v-on:click="register">Valider</button>
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
    data() {
        return {
            nom: null, // Nom entré par l'utilisateur
            prenom: null, // Prénom entré par l'utilisateur
            email: null, // Adresse e-mail entrée par l'utilisateur
            password: null, // Mot de passe entré par l'utilisateur
        }
    },
    methods: {
        // Méthode pour gérer l'inscription de l'utilisateur
        register() {
            let that = this; // Référence à l'instance actuelle du composant
            let responseResult = null; // Résultat de la requête HTTP
            let accountCreated = false; // Indicateur de réussite de création du compte

            // Envoi d'une requête HTTP POST au serveur pour s'inscrire
            axios.post('http://localhost:3000/register', {
                nom: this.nom, // Envoi du nom
                prenom: this.prenom, // Envoi du prénom
                email: this.email, // Envoi de l'adresse e-mail
                password: this.password // Envoi du mot de passe
            }, {headers: { skipAuth: true }})
                .then(function (response) {
                    // Si la requête a réussi, sauvegarde du résultat
                    responseResult = response.data;
                    accountCreated = true; // Indicate que le compte a bien été créé
                })
                .catch(function (error) {
                    // Gestion des erreurs spécifiques
                    if (error.response && error.response.status === 409) {
                        alert("L'adresse e-mail est déjà utilisée. Veuillez en utiliser une autre.");
                    } else {
                        alert('Une erreur serveur est survenue ! Réessayer ultérieurement .');
                    }
                })
                .finally(function () {
                    if (accountCreated) {
                        // Si le compte a été créé, redirection vers la page de connexion
                        that.$router.push('/');
                    }
                });
        },
        // Méthode pour rediriger l'utilisateur vers la page de connexion
        moveToLoginPage() {
            this.$router.push({name: 'home'});
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
