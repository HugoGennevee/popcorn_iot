<template>
    <div id="app" class="container py-5 full-screen">
        <div class="card mx-auto kiosk-card">
            <div class="card-body">
                <div class="about">
                    <h1 class="card-title text-center text-primary">Gestion de mon compte</h1>
                    <p class="text-center">Votre QRCode contient votre abonnement ainsi que vos achats. Veuillez à ne pas le perdre.</p>
                    <div class="row justify-content-center">
                        <div class="col-md-6">
                            <div class="input-group mb-3">
                                <input id="client-number-input" v-model="clientNumber" type="text" class="form-control"
                                    placeholder="Saisissez votre numéro client">
                                <div class="text-center input-group-append">
                                    <button @click="generateQrCode" class="btn btn-outline-primary m-2">Générer le QR
                                        code</button>
                                    <button @click="createNewClient" class="btn btn-outline-success m-2">Générer un nouveau numéro
                                        client</button>
                                </div>
                            </div>
                            <div v-if="qrData" class="text-center">
                                <qrcode-vue ref="qrcode" :value="qrData" :size="size" level="H"></qrcode-vue>

                                <button @click="downloadQrCode" class="btn btn-outline-info m-2">Télécharger le QR
                                    code</button>
                            </div>
                        </div>
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

export default {
    data() {
        return {
            clientNumber: '',
            qrData: '',
            size: 200,
        }
    },
    components: {
        QrcodeVue
    },
    methods: {
        generateQrCode() {
            this.qrData = this.clientNumber
        },
        createNewClient() {
            const newClientNumber = Math.floor(Math.random() * 1000000)
            this.clientNumber = newClientNumber.toString()
            this.generateQrCode()
        },
        async downloadQrCode() {
            const node = document.querySelector("#app > div > div > div > div > div > div.text-center > canvas")
            try {
                const dataUrl = await domToImage.toPng(node)
                download(dataUrl, 'abonnement_' + this.qrData + '.png')
            } catch (err) {
            }
        },
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
  