<template>
  <div id="app" class="container py-5 full-screen">
    <div class="card mx-auto kiosk-card">
      <div class="card-body">
        <div class="d-flex justify-content-center">
          <img src="../assets/popcorn.jpg" class="img-fluid w-25 my-4" alt="Popcorn" />
        </div>

        <h1 class="card-title text-center text-primary">Cinéma Gaumont</h1>

        <div v-if="carteScannee" class="text-center">
          <h2 class="mt-4">Bonjour, {{ nomClient }}!</h2>
          <p>Abonnement numéro {{ numeroCarte }}</p>
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

        <div v-else>
          <h2 class="mt-4 text-center">Veuillez vous identifier</h2>
          <p class="mt-4 text-center">Vous pouvez scanner votre carte ou entrer manullement votre numéro d'abonnement</p>
          <div class="input-group mt-3">
            <input
              class="form-control"
              v-model="numeroCarte"
              @keyup.enter="scannerCarte"
              placeholder="Numero de carte d'abonnement"
              autofocus
            />
            <div class="input-group-append">
              <button class="btn btn-primary" v-on:click="scannerCarte">Valider</button>
            </div>
          </div>
        </div>

        <div v-if="!carteScannee" class="center-button">
          <button id="scan_qrcode" class="btn btn-primary" v-on:click="startScanner">Scanner ma carte</button>
        </div>

        <div v-if="!carteScannee" id="qr-code-scanner"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { Html5Qrcode } from 'html5-qrcode';

export default {
  data() {
    return {
      qrCodeScanner: null,
      carteScannee: false,
      numeroCarte: '',
      nomClient: '',
      nombrePopcorn: 1,
      showCamera: false,
    }
  },
  mounted() {
    this.qrCodeScanner = new Html5Qrcode('qr-code-scanner');
  },
  beforeDestroy() {
    if (this.qrCodeScanner) {
      this.qrCodeScanner.clear();
    }
  },
  methods: {
    scannerCarte() {
      this.carteScannee = true
      this.nomClient = 'Client'
    },
    acheterPopcorn() {
      alert('Popcorn acheté ! Vous avez acheté ' + this.nombrePopcorn + ' popcorn(s).')
      this.numeroCarte = ''
      this.nomClient = ''
      this.carteScannee = false;
      Quagga.start();
    },
    startScanner() {
      this.qrCodeScanner
        .start({ facingMode: 'environment' }, 
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            this.numeroCarte = decodedText;
            this.carteScannee = true;
            this.qrCodeScanner.stop();
          },
          (errorMessage) => {
          }
        )
        .catch((err) => {
        });
    },
    onQrCodeScanned(decodedText) {
      this.numeroCarte = decodedText
      this.carteScannee = true
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
