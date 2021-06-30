<template>
  <div class="shows">
    <div class="show" @click="openShow()" v-for="show of data.shows" :key="show.ID" :id="show.ID">
      <p>{{show.ID}}</p>
      <p>{{show.title}}</p>
    </div>
    <div class="search">
      <input type="text" placeholder="Search Shows" @keydown="search()" id="searcher">
    </div>
  </div>
</template>

<script>
import {api} from "../config"
import {get} from "../fetch"
import {reactive} from "vue"

export default {
  name: 'Shows',
  setup(props, context) {
    const data = reactive({})

    async function init() {
      console.log(api.app + "/shows/all");
      data.shows = await get(api.app + "/shows/all")
    }

    function openShow() {
      const id = event.target.id
      context.emit("openShow", id)
    }

    async function search() {
      setTimeout(async () => {
        const query = document.getElementById("searcher").value
      
        if (query != "") {
          const results = await get(api.app + "/search/" + query)
          data.shows = results.results
        }
        else {
          data.shows = await get(api.app + "/shows/all")
        }
      }, 100);
    }

    init()

    return {data, search, openShow}
  }
}
</script>

<style scoped>
  .shows {
    margin-top: 80px;
  }

  .show {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 8px;
    padding: 8px;
    box-shadow: 0px 0px 2px var(--shadow);
    cursor: pointer;
  }

  .show:hover {
    background-color: var(--lblue);
  }

  .search {
    position: fixed;
    right: 30px;
    bottom: 30px;
    width: 300px;
    height: 30px;
    background-color: var(--white);
    box-shadow: 6px 6px 28px var(--shadow);
    border-radius: 5px;
  }

  .search input {
    width:100%;
    height: 100%;
    font-size: large;
    border-radius: 5px;
    padding: 5px;
  }
</style>
