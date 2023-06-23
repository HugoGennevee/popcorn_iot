<template>
  <div id="app" class="container py-5 full-screen text-center justify-center">
    <div class="card mx-auto kiosk-card">
      <div class="card-body">
        <div class="d-flex justify-content-center">
          <img src="../assets/popcorn.jpg" class="img-fluid w-25 my-4" alt="Popcorn" />
        </div>

        <h1 class="card-title text-center text-primary">Cinéma Gaumont</h1>
        <h2 class="mt-4 text-center">Machine à PopCorn</h2>

        <div>
          <div v-show="!carteScannee" key="scanner">
            <p>
              <small class="text-muted">
                Veuillez scanner votre carte pour obtenir votre PopCorn.
              </small>
            </p>

            <p>
              <small class="text-muted">
                Pour obtenir du PopCorn, vous devez avoir rechargé préalablement votre carte.
              </small>
            </p>

            <div class="center-button my-4">
              <button id="scan_qrcode" class="btn btn-primary" v-on:click="startScanner">
                Scanner ma carte
              </button>
            </div>

            <div class="center-button my-4">
              <input type="file" id="upload_qrcode" ref="qrcodeInput" @change="readQrCode" hidden />
              <button id="upload_qrcode_button" class="btn btn-primary" @click="uploadQrCode">
                Upload mon QrCode
              </button>
            </div>

            <div id="qr-code-scanner"></div>
          </div>

          <div v-show="carteScannee" key="dispenser">
            <h2 class="text-center">
              Bienvenue <span v-if="nom != null">{{ nom }}</span> !
            </h2>

            <div class="mt-4 d-flex justify-content-center align-items-center">
              <div class="popcorn-display-container">
                <p class="text-primary">Il vous reste {{ popcornPacks }} PopCorn.</p>
              </div>
            </div>

            <div v-if="!dispensing" class="center-button my-4">
              <button
                id="dispense_popcorn"
                class="btn btn-warning"
                v-on:click="dispensePopcorn"
                :disabled="popcornPacks <= 0"
              >
                Verser 1 popcorn
              </button>
            </div>

            <div v-if="!dispensing" class="center-button my-4">
              <button id="back_button" class="btn btn-primary" v-on:click="backToHome()">
                Revenir au menu
              </button>
            </div>

            <div v-if="dispensing" class="d-flex justify-content-center">
              <img src="../assets/all_popcorn.gif" class="img-fluid w-25 my-4" alt="Popcorn" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Importation des modules nécessaires
import { Html5Qrcode } from 'html5-qrcode'
import axios from 'axios'

export default {
    data() {
        return {
            carteScannee: false, // Etat du scan de la carte
            qrCodeScanner: null, // Objet pour le scanner de QR Code
            nom: null, // Nom de l'utilisateur
            popcornPacks: 0, // Nombre de packs de popcorn
            abonnement: null, // Abonnement de l'utilisateur
            dispensing: false // Etat de la distribution du popcorn
        }
    },
    // Initialisation du scanner QR Code au montage du composant
    mounted() {
        this.qrCodeScanner = new Html5Qrcode('qr-code-scanner')
    },
    // Nettoyage du scanner QR Code avant la destruction du composant
    beforeDestroy() {
        if (this.qrCodeScanner) {
            this.qrCodeScanner.clear()
        }
    },
    methods: {
        // Démarrage du scanner
        startScanner() {
            localStorage.removeItem('token')

            this.carteScannee = false
            this.qrCodeScanner
                .start(
                    { facingMode: 'environment' },
                    {
                        fps: 10, // 10 images par seconde
                        qrbox: { width: 250, height: 250 } // Taille de la zone de scan
                    },
                    (decodedText) => { // Callback quand un QR Code est scanné
                        this.numeroCarte = decodedText
                        this.carteScannee = true
                        this.qrCodeScanner.stop() // Arrête le scanner

                        this.requestDataFromCard(decodedText) // Récupère les données de l'utilisateur
                    },
                    (errorMessage) => {} // Callback quand une erreur se produit
                )
                .catch((err) => {}) // Gestion des erreurs
        },
        // Distribution du popcorn
        dispensePopcorn() {
            if (this.popcornPacks > 0) { // S'il y a assez de popcorn
                try {
                    let that = this
                    let responseResult = null
                    const token = localStorage.getItem('token')

                    // Envoie une requête POST pour signaler l'utilisation de la machine
                    axios
                        .post(
                            'http://localhost:3000/machine/use',
                            { id: this.abonnement, nbUtilisationsRestantes: this.popcornPacks },
                            { headers: { Authorization: `Bearer ${token}` } }
                        )
                        .then(function (response) { // Mise à jour de la réponse
                            responseResult = response.data
                        })
                        .catch(function (error) {}) // Gestion des erreurs
                        .finally(function () { // Actions finales
                            if (responseResult.status === true) {
                                that.popcornPacks -= 1 // Diminue le nombre de packs de popcorn
                            } else {
                                alert('Erreur pendant le scan !') // Affiche une alerte si le scan a échoué
                            }
                        })
                } catch (error) {
                }

                // Déclenche la distribution de popcorn
                this.dispensing = true
                // Arrête la distribution de popcorn après 3 secondes
                setTimeout(() => {
                    this.dispensing = false
                }, 3000)
            } else {
                // Affiche une alerte si le crédit est insuffisant
                alert("Vous n'avez plus assez de crédit ! Rechargez votre compte pour continuer.")
            }
        },
        // Importe un QR Code depuis un fichier
        uploadQrCode() {
            this.$refs.qrcodeInput.click()
        },
        // Lit le QR Code importé
        readQrCode(event) {
            const file = event.target.files[0]
            if (file) {
                this.qrCodeScanner
                    .scanFile(file, true)
                    .then((decodedText) => {
                        this.numeroCarte = decodedText
                        this.carteScannee = true

                        this.requestDataFromCard(decodedText) // Récupère les données de l'utilisateur
                    })
                    .catch((err) => {
                        console.error(err)
                    })
            }
        },
        // Envoie une requête POST pour récupérer les données de l'utilisateur
        requestDataFromCard(id) {
            let that = this
            let responseResult = null

            axios
                .post('http://localhost:3000/machine/check', { id: id }, { headers: { skipAuth: true } })
                .then(function (response) {
                    responseResult = response.data
                })
                .catch(function (error) {})
                .finally(function () {
                    if (responseResult !== null) {
                        that.nom = responseResult.nom
                        that.abonnement = responseResult.abonnement
                        that.popcornPacks = responseResult.nombreRestanteUtilisation

                        localStorage.setItem('token', responseResult.token) // Stocke le token de l'utilisateur
                    } else {
                        alert('Erreur pendant le scan !') // Affiche une alerte si le scan a échoué
                    }
                })
        },
        // Recharge la page
        backToHome() {
            location.reload();
        }
    },
}
</script>

<style scoped>
.kiosk-card {
  width: 800px;
  background: #f8f9fa;
  border-radius: 20px;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
}

.popcorn-display-container {
  text-align: center;
}

.popcorn-animation {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.popcorn {
  position: absolute;
  height: 50px;
  animation: fall linear infinite;
  animation-duration: 5s;
}

.popcorn img {
  height: 100%;
}

@keyframes fall {
  0% {
    transform: translateY(-100%);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh);
    opacity: 0;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
