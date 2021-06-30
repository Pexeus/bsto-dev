<template>
    <div class="dialogWrapper">
        <div id="dialog">
            <p>Are you sure?</p>
            <button @click="submit(true)" class="confirm">Confirm</button>
            <button @click="submit(false)" class="cancel">Cancel</button>
        </div>
    </div>
</template>

<script>
import { reactive } from "vue"
export default {
    setup(props, context) {
        const submit = (action) => {
            // [param] action
            // true     => confirm
            // false    => cancel

            context.emit("dialogSubmit", action)
        }

        return { submit }
    }
}
</script>

<style scoped>
* {
    transition: all ease-in-out .1s;
}
button { 
    color:#fff;
    box-shadow: 2px 2px 4px rgb(121, 121, 121);
    margin: 5px;
}
.confirm {
    background:rgb(23, 199, 82);
}
.cancel {
    background:rgb(199, 23, 90);
}
#dialog {
    display: inline-block;
    text-align:center;
    background:rgb(235, 235, 235);
    width:200px;
    vertical-align: middle;
    line-height: 40px;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 2px 2px 4px rgb(121, 121, 121);
    visibility: hidden;
}
button:hover {
    transform: scale(1.07);
}
.dialogWrapper {
    width:100%;
    background:#fff;
    text-align:center;
    height:85vh;
    line-height: 400px;
    vertical-align: middle;
}
</style>