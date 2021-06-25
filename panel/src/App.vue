<template>
  <Header/>
  <Shows @openShow="openShow($event)"/>
  <Show :id="data.show"/>
</template>

<script>
import Header from './components/Header.vue'
import Shows from './components/Shows.vue'
import Show from './components/Show'
import {reactive} from "vue"

export default {
  name: 'App',
  components: {
    Header,
    Shows,
    Show
  },
  setup() {
    const data = reactive({
      show: undefined,
    })

    function openShow(id) {
      console.log(id);
      data.show = id
    }

    return {openShow, data}
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
