<template>
    <div class="queue">
        <div class="status" v-if="data.status != undefined">
            <div class="statusBlock">
                <p>Queue Service: </p>
                <p v-if="data.status[0].pm2_env.status == `stopped`" class="-status -red">{{data.status[0].pm2_env.status}}</p>
            </div>
            <div class="statusBlock">
                <p v-if="data.scraper.lastJobRequest == 0" class="-status -red">Scraper Offline</p>
                <p v-if="data.scraper.lastJobRequest != 0" class="-status -green">Scraper Online</p>
                <p>Requested a Job {{data.scraper.lastJobRelative}} ago</p>
            </div>
            <div class="statusBlock">
                <p>Shows in Queue: {{data.queue.length}}</p>
            </div>
        </div>
        <div class="list">
            <div class="queueItem" v-for="show in data.queue" :key="show">
            <p>{{new Date(show.added).toDateString()}}, {{new Date(show.added).toLocaleTimeString()}}</p>
            <p>{{show.title}}</p>
            <p v-if="show.status == `queued`" class="-status -green">{{show.status}}</p>
            <p v-if="show.status == `updating`" class="-status -orange">{{show.status}}</p>
        </div>
        </div>
    </div>
</template>
<script>
import {api} from "../config"
import {get} from "../fetch"
import {reactive} from "vue"

export default {
    name: 'Queue',
    setup() {
        const data = reactive({})

        async function init() {
            const queue = await get(api.dev + "/queue/status")
            console.log(queue);
            console.log(queue.scraper.lastJobRequest);
            queue.scraper.lastJobRelative = getTimeRelative(queue.scraper.lastJobRequest)

            Object.assign(data, queue)
        }

        function getTimeRelative(time) {
            if (time == 0) {
                return false
            }

            let tDiff

            if (Math.round((Date.now() - time) / 1000 / 60) < 60) {
                tDiff = Math.round((Date.now() - time) / 1000 / 60) + " Minutes"
            }
            else{
                tDiff = Math.round((Date.now() - time) / 1000 / 60 / 60) + " Hours"
            }

            return tDiff
        }

        init()

        return {data,}
    }
}
</script>

<style scoped>
    .queue {
        margin-top: 90px;
    }

    .status {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 18px;
        padding: 18px;
        padding-top: 30px;
        padding-bottom: 30px;
        box-shadow: 0px 0px 2px var(--shadow);
        background-color: var(--white);
        border-radius: 8px;
    }

    .statusBlock {
        padding: 15px;
    }

    .statusBlock p {
        display: inline-block;
        margin-right: 10px;
    }

    .queueItem {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 8px;
        padding: 8px;
        box-shadow: 0px 0px 2px var(--shadow);
    }
</style>