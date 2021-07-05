<template>
    <div class="queue">
        <div class="status" v-if="data.status != undefined">
            <p v-if="data.status[0].pm2_env.status != ``" class="-status -red">{{data.status[0].pm2_env.status}}</p>
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
            Object.assign(data, queue)
            console.log(data);
        }

        init()

        return {data,}
    }
}
</script>

<style scoped>
    .queue {
        margin-top: 80px;
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

    .queueItem {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 8px;
        padding: 8px;
        box-shadow: 0px 0px 2px var(--shadow);
    }
</style>