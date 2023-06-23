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

                <div class="row">
                    <nav class="d-flex justify-content-center align-items-center">
                        <button class="btn" v-on:click="moveToAbonnementPage"><a class="text-primary fa-italic fa-underline">Abonnement</a></button>
                        <button class="btn btn-primary text-white fa-italic mx-2" v-on:click="moveToQrCodePage">QrCode</button>
                    </nav>
                </div>

                <h2 class="text-center mt-4">Gestion de mon compte</h2>
                <p class="text-center">Votre QRCode contient votre abonnement ainsi que vos achats. <br> Veuillez à ne pas le perdre.</p>
                <div class="row">
                    <div v-if="qrData" class="text-center">
                        <div class="col-12">
                            <qrcode-vue ref="qrcode" :value="qrData" :size="size" level="H"></qrcode-vue>
                        </div>

                        <div class="col-12 text-center">
                            <button @click="downloadQrCode" class="btn btn-outline-info m-2">Télécharger le QR Code</button>
                        </div>
                    </div>

                    <div v-else class="col text-center">
                        <button @click="generateQrCode" class="btn btn-outline-primary m-2">Générer le QR Code</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import QrcodeVue from 'qrcode.vue'
import domToImage from 'dom-to-image'
import download from 'downloadjs'
import axios from "axios";

export default {
    data() {
        return {
            clientNumber: '',
            qrData: '',
            size: 200,
            user: null,
            abonnement: null,
        }
    },
    components: {
        QrcodeVue
    },
    mounted() {
        this.getUser(this.$route.params.userId);
    },
    methods: {
        async getUser(id) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:3000/user/${id}`, {headers: {'Authorization': `Bearer ${token}`}});

                this.user = response.data;

                await this.getAbonnementUser();
            } catch (error) {
                console.error(error);
            }
        },
        async getAbonnementUser() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:3000/user/${this.user.id}/abonnement`, {headers: {'Authorization': `Bearer ${token}`}});

                this.abonnement = response.data;
            } catch (error) {
                console.error(error);
            }
        },
        generateQrCode() {
            this.qrData = this.user.id;
        },
        async downloadQrCode() {
            const node = document.querySelector("#app > div > div > div:nth-child(7) > div > div:nth-child(1)")
            try {
                const dataUrl = await domToImage.toPng(node)
                download(dataUrl, 'abonnement_' + this.qrData + '.png')
            } catch (err) {
            }
        },
        moveToAbonnementPage() {
            this.$router.push({name: 'abonnement', params: {userId: this.user.id}});
        },
        moveToQrCodePage() {
            this.$router.push({name: 'qrcode', params: {userId: this.user.id}});
        },
        moveToLoginPage() {
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

.about {
    padding: 20px;
}

.btn {
    margin-left: 5px;
}

.container {
    max-width: 600px;
}</style>
