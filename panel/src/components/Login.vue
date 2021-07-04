<template>
    <div class="loginWrapper">
        <div class="login">
            <h2>Login</h2>
            <div class="inp">
                <input id="username" type="text" placeholder="username..">
                <input id="password" type="password" placeholder="password..">
                <button @click="submit()" type="button">Login</button>
            </div>
        </div>
    </div>
</template>

<script>
import { reactive } from "vue"
import config from "../config.json"

export default {
    setup(props, context) {
        const data = reactive({})

        function decodeToken(token) {
            let payload = token.replace(/-/g, '+').replace(/_/g, '/').split('.')[1]
            payload = JSON.parse(Buffer.from(payload, 'base64').toString())
            return payload
        }

        const submit = async () => {
            let inputs = {
                username: document.getElementById("username").value,
                password: document.getElementById("password").value
            }

            let valid = inputs.username != "" && inputs.password != ""

            if(valid) {
                let fetchOptions = {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    method: "POST",
                    body: JSON.stringify(inputs)
                }

                let response = await fetch(`${config.host}login`, fetchOptions)
                let result = await response.json()


                if(result.username == false) {
                    alert("error, user does not exist")
                }
                else if(result.password == false) {
                    alert("error, wrong password")
                }
                else { 
                    let token = decodeToken(result)
                    if(token.perm == "admin") {
                        context.emit("loggedIn", result)
                    }
                    else { 
                        alert("error, permission denied")
                    }
                }
            }
            else { 
                alert("empty inputs")
            }
        }

        return { data, submit }
    }
}
</script>

<style scoped>
input { 
    border: 1px solid black;
    padding:7px;
}
.inp * {
    display: block;
}
</style>