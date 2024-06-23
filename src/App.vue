<template>
  <!-- <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </nav> -->
  <div class="page-container">
    <router-view />
  </div>
</template>

<style>
#app {
  text-align: center;
  color: #2c3e50;
}

.page-container {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
}
</style>
