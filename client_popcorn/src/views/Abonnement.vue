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
import axios from 'axios';
import {RouterLink} from "vue-router";

export default {
    components: {RouterLink},
    data() {
        return {
            nombrePopcorn: 1,
            user: null,
            abonnement: null,
        }
    },
    mounted() {
        this.getUser(this.$route.params.userId);
    },
    methods: {
        async getUser(id) {
            try {
                const response = await axios.get('http://localhost:3000/user/' + id);
                this.user = response.data;

                await this.getAbonnementUser();
            } catch (error) {
                console.error(error);
            }
        },
        async getAbonnementUser() {
            try {
                const response = await axios.get('http://localhost:3000/user/' + this.user.id + '/abonnement');
                this.abonnement = response.data;
            } catch (error) {
                // console.error(error);
            }
        },
        acheterPopcorn() {
            let that = this;

            axios.put('http://localhost:3000/abonnement/' + this.abonnement.id, {
                nbUtilisationsRestantes: this.abonnement.nbUtilisationsRestantes + this.nombrePopcorn,
            })
            .then(function (response) {
                that.abonnement.nbUtilisationsRestantes = response.data.nb_utilisations_restantes;
            })
            .catch(function (error) {});

            alert('Popcorn acheté ! Vous avez acheté ' + this.nombrePopcorn + ' popcorn(s).')
        },
        suscribeAbonnement() {
            axios.post('http://localhost:3000/abonnement/' + this.user.id, {})
            .then(function (response) {
                window.location.reload();
            })
            .catch(function (error) {});
        },
        moveToAbonnementPage() {
            this.$router.push({name: 'abonnement', params: {userId: this.user.id}});
        },
        moveToQrCodePage() {
            this.$router.push({name: 'qrcode', params: {userId: this.user.id}});
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
