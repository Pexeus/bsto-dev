<template>
  <div class="show" id="showPanel">
    <i v-if="data.show != undefined" class="gg-close" @click="closeShow()"></i>

    <div v-if="data.show == undefined" class="loader">
      <i class="gg-loadbar-alt"></i>
    </div>

    <div class="info"  v-if="data.show != undefined">
        <h2>{{data.show.info.title}}</h2>
        <div class="textimg">
            <p>{{data.show.info.desc}}</p>
            <img :src="data.show.info.cover" alt="">
        </div>
    </div>
    <div class="episodes" v-if="data.show != undefined">
        <div class="season" v-for="season of data.show.seasons" :key="season">
            <h2 class="seasonIndex">Season {{season.index}}</h2>
            <table>
              <th>Episode ID</th>
              <th>Season ID</th>
              <th>Show ID</th>
              <th>Title</th>
              <th>bs.to Link</th>
              <th>Vivo Link</th>
              <tr class="episode" v-for="episode in season.episodes" :key="episode">
                <td>{{episode.ID}}</td>
                <td>{{episode.ID_season}}</td>
                <td>{{episode.ID_show}}</td>
                <td>{{episode.title}}</td>
                <td><a :href="episode.bs_link">{{episode.bs_link}}</a></td>
                <td><a :href="episode.vivo_link">{{episode.vivo_link}}</a></td>
              </tr>
            </table>
        </div>
    </div>
    <div class="spacer"></div>
  </div>
</template>

<script>
import {api} from "../config"
import {get} from "../fetch"
import {reactive, watch} from "vue"

export default {
  name: 'Show',
  props: {
    id: String,
  },
  setup(props, context) {
    const data = reactive({})
    //wird nach login gefixt
    const globalUser = 3

    async function init(id) {
      document.getElementById("showPanel").classList.add("active")
      const show = await get(`${api.app}/episodes/${id}?UID=${globalUser}`)
      console.log(show);
      data.show = show
    }

    function closeShow() {
      document.getElementById("showPanel").classList.remove("active")
    }

    watch(() => props.id, async () => {
        if (props.id != undefined) {
          init(props.id)
        }
    })

    return {data, closeShow}
  }
}
</script>

<style scoped>
  .show {
    width: calc(100% - 60px);
    height: 100vh;
    overflow: scroll;
    background-color: var(--white);
    visibility: hidden;
    position: fixed;
    top: 100vh;
    left: 0;
    z-index: 200;
    padding: 30px;
    opacity: 0;
  }

  .gg-close {
    position: absolute;
    top: 20px;
    right: 20px;
    transform: scale(1.3);
    cursor: pointer;
    opacity: .8;
  }

  .gg-close:hover {
    opacity: 1;
  }

  .loader {
    position: fixed;
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
  }

  .loader i {
    transform: scale(6);
  }

  .active {
    visibility: visible;
    opacity: 1;
    top: 0;
  }

  .info {
    text-align: left;
  }

  .textimg {
    display: flex;
  }

  img {
    padding-left: 15px;
  }

  h2 {
    margin-bottom: 20px;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 30px;
  }

  th, td {
    padding: 5px;
    text-align: left;
  }

  tr:nth-child(even) {background: #CCC}

  th {
    background-color: var(--blue);
    color: var(--white)
  }

  .spacer {
    height: 30px;
  }
</style>
