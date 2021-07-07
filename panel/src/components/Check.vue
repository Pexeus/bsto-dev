<template>
  <div class="check" id="checkPanel">
    <i v-if="data.set != undefined" class="gg-close" @click="closeShow()"></i>

    <div v-if="data.set == undefined" class="loader">
      <i class="gg-loadbar-alt"></i>
    </div>

    <div v-if="data.set != undefined">
      <h1>{{data.title}}</h1>

      <div class="quickcheck -box -round">
        <h2>Seasons</h2>
        <p>Locally available: {{data.set.episodes.local.length}}</p>
        <p>Remotly available: {{data.set.episodes.remote.length}}</p>
        <h3 v-if="data.set.episodes.local.length == data.set.episodes.remote.length" class="-status -green">Passed</h3>
        <h3 v-if="data.set.episodes.local.length != data.set.episodes.remote.length" class="-status -red">Failed</h3>
      </div>

      <div class="quickcheck -box -round">
        <h2>Episodes</h2>
        <p>Locally available: {{data.set.compare.local.episodes}}</p>
        <p>Remotly available: {{data.set.compare.remote.episodes}}</p>
        <h3 v-if="data.set.compare.status == true" class="-status -green">Passed</h3>
        <h3 v-if="data.set.compare.status == false" class="-status -red">Failed</h3>
      </div>
    </div>

    <div v-if="data.analysis != undefined">
      <div class="unscraped" v-if="data.analysis.overflow != false">
        <h1>Unscraped Episodes</h1>
        <div class="season" v-for="(season, index) of data.analysis.overflow" :key="season">
          <div v-if="season.looped != true">
            <h2>Season {{index + 1}}</h2>
              <table>
                <th>Title</th>
                <th>Link</th>
                <tr class="episode" v-for="episode in season.episodes" :key="episode">
                  <td>{{episode.title}}</td>
                  <td><a :href="episode.href">{{episode.href}}</a></td>
                </tr>
              </table>
          </div>
        </div>
      </div>
      
      <h1>Available Episodes</h1>
      <div class="season" v-for="season of data.analysis.combined" :key="season">
          <h2>Season {{season.index + 1}}</h2>
          <table>
                <th>Title local</th>
                <th>Vivo</th>
                <th>Title remote</th>
                <th>Match</th>
                <tr class="episode" v-for="episode in season.episodes" :key="episode">
                  <td><a :href="episode.local.link">{{episode.local.title}}</a></td>
                  <td><a :href="episode.local.vivo">{{episode.local.vivo}}</a></td>
                  <td><a :href="episode.remote.link">{{episode.remote.title}}</a></td>
                  <td v-if="episode.match == true"><p class="-status -green">Passed</p></td>
                  <td v-if="episode.match == false"><p class="-status -red">Failed</p></td>
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
    title: String,
  },
  setup(props, context) {
    const data = reactive({})
    const debug = false

    async function init(title) {
      console.log(data.set);
      console.log("Loading", title);
      document.getElementById("checkPanel").classList.add("active")
      var dataset

      data.title = title
      if (!debug) {
        dataset = await get(`${api.dev}/grabber/check/${title}`)
      }

      data.set = dataset

      const analysis =analyze(dataset.episodes)
      console.log(analysis);

      data.analysis = analysis
    }

    function checkLinkMatch(l1, l2) {
      if (l1.includes(l2) || l2.includes(l1)) {
        return true
      }

      return false
    }

    function analyze(set) {
      const seasons = []
      var episodesMissing = false

      if (set.local.length < set.remote.length) {
        episodesMissing = true
      }

      set.local.forEach((season, sIndex) => {
        var remoteSeason = set.remote[sIndex]

        if (remoteSeason == undefined) {
          remoteSeason = {
            episodes: []
          }
        }

        if (season.episodes.length < remoteSeason.episodes.length) {
          episodesMissing = true
        }

        if (season.episodes.length >= remoteSeason.episodes.length) {
          remoteSeason.looped = true
        }
        const result = []

        season.episodes.forEach((episode, eIndex) => {
          var remoteEpisode = remoteSeason.episodes[eIndex]
          let stringCheck = true

          if (remoteEpisode != undefined) {
            remoteEpisode.looped = true

            if (episode.title != remoteEpisode.title || !checkLinkMatch(episode.bs_link, remoteSeason.episodes[eIndex].href)) {
              stringCheck = false
            }
          }
          else {
            remoteEpisode = {
              title: "unavailable",
              link: "unavailable"
            }

            stringCheck = false
          }

          result.push({
            match: stringCheck,
            index: eIndex,
            local: {
              title: episode.title,
              link: episode.bs_link,
              vivo: episode.vivo_link
            },
            remote: {
              title: remoteEpisode.title,
              link: remoteEpisode.href
            }
          })
        })

        seasons.push({
          index: sIndex,
          episodes: result
        })
      })

      console.log(seasons);
      console.log(set);

      let overflow = set.remote
      if (!episodesMissing) {
        overflow = false
      }

      return {
        combined: seasons,
        overflow: overflow
      }
    }

    function closeShow() {
      data.set = undefined
      data.analysis = undefined
      document.getElementById("checkPanel").classList.remove("active")
    }

    watch(() => props.title, async () => {
        if (props.title != undefined) {
          init(props.title)
        }
    })

    return {data, closeShow}  }
}
</script>

<style scoped>
  .check {
    width: calc(100% - 30px);
    height: 100vh;
    overflow: scroll;
    background-color: var(--white);
    visibility: hidden;
    position: fixed;
    top: 100vh;
    left: 0;
    z-index: 200;
    padding: 15px;
    opacity: 0;
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

  h1 {
    margin-bottom: 20px;
  }

  .unscraped {
    box-shadow: 0px 0px 8px red;
    padding: 10px;
    margin-top: 40px;
    margin-bottom: 40px;
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

  .active {
    visibility: visible;
    opacity: 1;
    top: 0;
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

  tr:nth-child(even) {background: rgb(218, 213, 215)}

  th {
    background-color: var(--blue);
    color: var(--white)
  }

  .spacer {
    height: 30px;
  }

  .quickcheck .-status {
    margin-top: 15px;
  }
</style>
