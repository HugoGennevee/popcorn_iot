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

                <div v-if="abonnement !== null" class="row">
                    <nav class="d-flex justify-content-center align-items-center">
                        <button class="btn btn-primary text-white fa-italic mx-2" v-on:click="moveToAbonnementPage">Abonnement</button>
                        <button class="btn" v-on:click="moveToQrCodePage"><a class="text-primary fa-italic fa-underline">QrCode</a></button>
                    </nav>
                </div>

                <div v-if="user !== null && abonnement !== null" class="text-center">
                    <h2 class="text-center mt-4">Bonjour, {{ user.prenom }}!</h2>

                    <p>Abonnement numéro {{ abonnement.id }}</p>
                    <p>Nombre d'utilisation restante : {{ abonnement.nbUtilisationsRestantes }}</p>

                    <div class="input-group mt-3">
                        <input
                                class="form-control"
                                v-model.number="nombrePopcorn"
                                type="number"
                                min="1"
                                placeholder="Nombre de popcorn"
                        />
                    </div>
                    <button class="btn btn-success mt-3 w-100 py-2" v-on:click="acheterPopcorn">
                        Acheter du Popcorn
                    </button>
                </div>

                <div v-else class="text-center mt-4">
                    <button class="btn btn-success" v-on:click="suscribeAbonnement">Adhéré à un abonnement</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// Importation des modules nécessaires
import axios from 'axios';
import {RouterLink} from "vue-router";

export default {
    components: {RouterLink},
    data() {
        return {
            nombrePopcorn: 1, // Le nombre de popcorns à acheter
            user: null, // Les données de l'utilisateur actuel
            abonnement: null, // Les données de l'abonnement de l'utilisateur
        }
    },
    // Une fois le composant monté, récupère les données de l'utilisateur
    mounted() {
        this.getUser(this.$route.params.userId);
    },
    methods: {
        // Fonction asynchrone pour obtenir les données de l'utilisateur
        async getUser(id) {
            try {
                // Récupère le token JWT du localStorage
                const token = localStorage.getItem('token');

                // Fait une requête GET pour obtenir les données de l'utilisateur
                const response = await axios.get(`http://localhost:3000/user/${id}`, {headers: {'Authorization': `Bearer ${token}`}});
                // Met à jour les données de l'utilisateur dans le composant
                this.user = response.data;

                // Obtient les données de l'abonnement de l'utilisateur
                await this.getAbonnementUser();
            } catch (error) {
                console.error(error);
            }
        },
        // Fonction asynchrone pour obtenir les données de l'abonnement de l'utilisateur
        async getAbonnementUser() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:3000/user/${this.user.id}/abonnement`, {headers: {'Authorization': `Bearer ${token}`}});

                this.abonnement = response.data;
            } catch (error) {
                // console.error(error);
            }
        },
        // Fonction pour acheter des popcorns
        acheterPopcorn() {
            let that = this;
            const token = localStorage.getItem('token');

            // Fait une requête PUT pour mettre à jour l'abonnement de l'utilisateur
            axios.put(`http://localhost:3000/abonnement/${this.abonnement.id}`, {
                nbUtilisationsRestantes: this.abonnement.nbUtilisationsRestantes + this.nombrePopcorn,
            }, {headers: {'Authorization': `Bearer ${token}`}})
                .then(function (response) {
                    // Met à jour le nombre d'utilisations restantes de l'abonnement
                    that.abonnement.nbUtilisationsRestantes = response.data.nb_utilisations_restantes;
                })
                .catch(function (error) {});

            alert('Popcorn acheté ! Vous avez acheté ' + this.nombrePopcorn + ' popcorn(s).')
        },
        // Fonction pour souscrire à un abonnement
        suscribeAbonnement() {
            const token = localStorage.getItem('token');

            axios.post(`http://localhost:3000/abonnement/${this.user.id}`, {}, {headers: {'Authorization': `Bearer ${token}`}})
                .then(function (response) {
                    // Recharge la page après avoir souscrit à un abonnement
                    window.location.reload();
                })
                .catch(function (error) {});
        },
        // Fonctions pour se déplacer entre les pages
        moveToAbonnementPage() {
            this.$router.push({name: 'abonnement', params: {userId: this.user.id}});
        },
        moveToQrCodePage() {
            this.$router.push({name: 'qrcode', params: {userId: this.user.id}});
        },
        moveToLoginPage() {
            // Supprime le token JWT du localStorage et redirige vers la page de connexion
            localStorage.removeItem('token');
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
