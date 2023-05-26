<template>
  <div id="app" class="container py-5 full-screen">
    <div class="card mx-auto kiosk-card">
      <div class="card-body">
        <div class="d-flex justify-content-center">
          <img src="../assets/popcorn.jpg" class="img-fluid w-50 my-4" alt="Popcorn" />
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

        <div class="center-button" v-if="!carteScannee">
          <button id="scan_carte" class="btn btn-primary" v-on:click="startScanner">Scanner ma carte</button>
        </div>

        <div  v-if="!carteScannee" id="barcode-scanner"></div>
      </div>
    </div>
  </div>
</template>

<script>
import Quagga from 'quagga'

export default {
  data() {
    return {
      carteScannee: false,
      numeroCarte: '',
      nomClient: '',
      nombrePopcorn: 1,
      showCamera: false,
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
      Quagga.init(
        {
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: document.querySelector('#barcode-scanner')
          },
          decoder: {
            readers: ['ean_reader']
          }
        },
        function (err) {
          if (err) {
            console.log(err)
            return
          }
          Quagga.start()
        }
      )

      Quagga.onDetected(this.onBarcodeDetected)
    },

    onBarcodeDetected(data) {
      this.numeroCarte = data.codeResult.code
      this.carteScannee = false;
      Quagga.stop()
    }
  }
}
</script>

<style scoped>
.full-screen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

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
