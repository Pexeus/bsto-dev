<template>
  <div class="shows">
    <div class="showItem" v-for="show of data.shows" :key="show.ID" :id="show.ID">
      <p>{{show.ID}}</p>
      <p>{{show.title}}</p>
      <div class="buttonSection">
        <button v-if="show.queueProcessing == undefined" class="-green" :id="show.title" @click="queueShow(show)">Queue</button>
        <div v-if="show.queueProcessing == true"><i class="gg-spinner-alt"></i></div>
        <div v-if="show.queueProcessing == `done`"><i class="gg-check-o"></i></div>
        <div v-if="show.queueProcessing == `failed`"><i class="gg-close-o"></i></div>
        <button :id="show.ID" class="-green" @click="openShow()">Inspect</button>
        <button :id="show.title" class="-green" @click="openCheck()">Check</button>
      </div>
    </div>
    <div class="search">
      <input type="text" placeholder="Search Shows" @keydown="search()" id="searcher">
    </div>
    <Show :id="data.showID"/>
    <Check :title="data.checkTitle"/>
  </div>
</template>

<script>
import {api} from "../config"
import {get, post} from "../fetch"
import {reactive} from "vue"
import Show from "./Show"
import Check from "./Check"

export default {
  name: 'Shows',
  components: {
    Show,
    Check
  },
  setup(props, context) {
    const data = reactive({})

    async function init() {
      console.log(api.app + "/shows/all");
      data.shows = await get(api.app + "/shows/all")
    }

    function openShow() {
      const id = event.target.id
      data.showID = id
    }

    function openCheck() {
      const title = event.target.id
      data.checkTitle = title
    }

    async function search() {
      setTimeout(async () => {
        const query = document.getElementById("searcher").value.toLowerCase()
      
        if (query != "") {
          const results = await get(api.app + "/search/" + query)
          console.log(query, results.results);
          data.shows = results.results
        }
        else {
          data.shows = await get(api.app + "/shows/all")
        }
      }, 100);
    }

    async function queueShow(show) {
      show.queueProcessing = true
      const result = await post(api.dev + `/queue/add/${show.title}`)
      
      if (result.status == true) {
        show.queueProcessing = "done"
      }
      else {
        show.queueProcessing = "failed"
      }
    }

    init()

    return {data, search, openShow, openCheck, queueShow}
  }
}
</script>

<style scoped>
  .shows {
    margin-top: 80px;
  }

  .showItem {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 8px;
    padding: 8px;
    box-shadow: 0px 0px 2px var(--shadow);
  }

  .buttonSection {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .buttonSection button {
    margin-left: 20px;
  }

  .buttonSection div   {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 30px;
    margin-left: 20px;
    padding-left: 8px;
    padding-right: 8px;
    border-radius: 8px;
    box-shadow: 0px 0px 3px var(--shadow);
    background-color: var(--green)
  }

  .buttonSection div i {
    filter: invert(1);
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
