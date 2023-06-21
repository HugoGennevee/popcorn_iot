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
import axios from 'axios';

export default {
    data() {
        return {
            nom: null,
            prenom: null,
            email: null,
            password: null,
        }
    },
    methods: {
        register() {
            let that = this;
            let responseResult = null;

            axios.post('http://localhost:3000/register', {
                nom: this.nom,
                prenom: this.prenom,
                email: this.email,
                password: this.password
            }, {headers: { skipAuth: true }})
            .then(function (response) {
                responseResult = response.data;
            })
            .catch(function (error) {})
            .finally(function () {
                that.$router.push('/');
            });
        },
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
