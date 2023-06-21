<template>
  <div id="app" class="container py-5 full-screen text-center justify-center">
    <div class="card mx-auto kiosk-card">
      <div class="card-body">
        <div class="d-flex justify-content-center">
          <img src="../assets/popcorn.jpg" class="img-fluid w-25 my-4" alt="Popcorn" />
        </div>

        <h1 class="card-title text-center text-primary">Cinéma Gaumont</h1>
        <h2 class="mt-4 text-center">Machine à PopCorn</h2>

        <transition name="fade">
          <div v-if="!carteScannee" key="scanner">
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

          <div v-else key="dispenser">
            <h2 class="text-center">Bienvenue Didier !</h2>

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
              <button id="back_button" class="btn btn-primary" v-on:click="startScanner">
                Revenir au menu
              </button>
            </div>

            <div v-if="dispensing" class="d-flex justify-content-center">
              <img src="../assets/all_popcorn.gif" class="img-fluid w-25 my-4" alt="Popcorn" />
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>
  


<script>
import { Html5Qrcode } from 'html5-qrcode'

export default {
  data() {
    return {
      email: null,
      password: null,
      carteScannee: false,
      qrCodeScanner: null,
      popcornPacks: 5,
      dispensing: false
    }
  },
  mounted() {
    this.qrCodeScanner = new Html5Qrcode('qr-code-scanner')
  },
  beforeDestroy() {
    if (this.qrCodeScanner) {
      this.qrCodeScanner.clear()
    }
  },
  methods: {
    startScanner() {
      this.carteScannee = false
      this.qrCodeScanner
        .start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            this.numeroCarte = decodedText
            this.carteScannee = true
            this.qrCodeScanner.stop()
          },
          (errorMessage) => {}
        )
        .catch((err) => {})
    },
    onQrCodeScanned(decodedText) {
      this.numeroCarte = decodedText
      this.carteScannee = true
    },
    dispensePopcorn() {
      if (this.popcornPacks > 0) {
        this.popcornPacks -= 1
        this.dispensing = true
        setTimeout(() => {
          this.dispensing = false
        }, 3000)
      }
    },
    uploadQrCode() {
      this.$refs.qrcodeInput.click()
    },
    readQrCode(event) {
      const file = event.target.files[0]
      if (file) {
        this.qrCodeScanner
          .scanFile(file, true)
          .then((decodedText) => {
            this.numeroCarte = decodedText
            this.carteScannee = true
          })
          .catch((err) => {
            console.error(err)
          })
      }
    }
  },
  watch: {
    carteScannee() {
      if (this.carteScannee) {
        console.log('La carte est scannée...')
      } else {
        console.log('La carte n\'est pas scannée...')
      }
    },
  }
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
