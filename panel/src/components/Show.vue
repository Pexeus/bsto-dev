<template>
  <div class="show" id="showPanel">
    <div class="info"  v-if="data.show != undefined">
        <h2>{{data.show.info.title}}</h2>
        <div class="textimg">
            <p>{{data.show.info.desc}}</p>
            <img :src="data.show.info.cover" alt="">
        </div>
    </div>
    <div class="episodes" v-if="data.show != undefined">
        <div class="season" v-for="season of data.show.seasons" :key="season">
            <h2>{{season.index}}</h2>
            <div class="episode" v-for="episode in season.episodes" :key="episode">
                <p>{{episode.title}}</p>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import {api} from "../config"
import {get} from "../fetch"
import {reactive, watch} from "vue"

export default {
  name: 'Show',
  props: {
    id: Number,
  },
  setup(props, context) {
    const data = reactive({})
    //wird nach login gefixt
    const globalUser = 3

    async function init(id) {
        const show = await get(`${api.app}/episodes/${id}?UID=${globalUser}`)
        console.log(show);
        data.show = show

        document.getElementById("showPanel").classList.add("active")
    }

    watch(() => props.id, async () => {
        if (props.id != undefined) {
            init(props.id)
        }
    })

    return {data}
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
    top: 0;
    left: 0;
    z-index: 200;
    padding: 30px;
  }

  .active {
    visibility: visible;
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
</style>
