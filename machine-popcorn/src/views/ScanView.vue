<template>
    <div id="app" class="container py-5 full-screen">
        <div class="card mx-auto kiosk-card">
            <div class="card-body">
                <div class="d-flex justify-content-center">
<!--                    <img src="../assets/popcorn.jpg" class="img-fluid w-25 my-4" alt="Popcorn"/>-->
                </div>

                <h1 class="card-title text-center text-primary">Cinéma Gaumont</h1>

                <h2 class="mt-4 text-center">Machine à popcorn</h2>

                <div class="row mt-2">
                    <div class="col text-center">
                        <button class="btn btn-primary" v-on:click="scan">Scan</button>
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
            email: null,
            password: null,
        }
    },
    methods: {
        scan() {

        }
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
</style>
