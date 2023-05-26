<template>
  <div id="app" class="container py-5 full-screen">
    <div class="card mx-auto kiosk-card">
      <div class="card-body">
        <h1 class="card-title text-center text-primary">Cinéma Gaumont</h1>

        <div class="d-flex justify-content-center">
          <img src="../assets/popcorn.jpg" class="img-fluid w-50 my-4" alt="Popcorn" />
        </div>

        <div v-if="carteScannee" class="text-center">
          <h2 class="mt-4">Bonjour, {{ nomClient }}!</h2>
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
          <h2 class="mt-4 text-center">Veuillez scanner votre carte d'abonnement</h2>
          <div class="input-group mt-3">
            <input
              class="form-control"
              v-model="numeroCarte"
              placeholder="Numero de carte d'abonnement"
            />
            <div class="input-group-append">
              <button class="btn btn-primary" v-on:click="scannerCarte">Scanner</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      carteScannee: false,
      numeroCarte: '',
      nomClient: '',
      nombrePopcorn: 1
    }
  },
  methods: {
    scannerCarte() {
      this.carteScannee = true
      this.nomClient = 'Client'
    },
    acheterPopcorn() {
      alert('Popcorn acheté ! Vous avez acheté ' + this.nombrePopcorn + ' popcorn(s).')
      this.numeroCarte = '';
      this.nomClient = '';
      this.carteScannee = false;
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

</style>
