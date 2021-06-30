<template>
  <Login v-if="!data.isLoggedIn" @loggedIn="storeToken($event)"/>
  <Header @showDialog="showDialog()" v-if="data.isLoggedIn" @pageChanged="setActivePage($event)" :pageActive="data.pageActive"/>
  <Shows v-if="data.isLoggedIn && data.pageActive == 0"/>
  <Dialog @dialogSubmit="submitDialog($event)" />
</template>

<script>
import { reactive } from "vue"

import Dialog from "./components/Dialog"
import Login from "./components/Login"
import Header from './components/Header.vue'
import Shows from './components/Shows.vue'
import Show from './components/Show'
import {reactive} from "vue"

export default {
  name: 'App',
  components: {
    Header,
    Shows,
    Login,
    Dialog
  },
  setup() {
    const data = reactive({
      pageActive:0,
      isLoggedIn: false,
    })

    const setActivePage = (id) => {
      //console.log("pageActive =>", id)
      data.pageActive = id
    }

    function openShow(id) {
      console.log(id);
      data.show = id
    }

    function decodeToken(token) {
          let payload = token.replace(/-/g, '+').replace(/_/g, '/').split('.')[1]
          payload = JSON.parse(Buffer.from(payload, 'base64').toString())
          return payload
    }

    const submitDialog = (e) => {
        if(e) {
          // disable dialog + logout
          hideDialog()
          logout()
        }
        else { 
          hideDialog()
        }
    }

    const checkToken = () => {
      let token = localStorage.jwt
      if(token != undefined) {
          let decoded = decodeToken(token)
          if(decoded.iat < decoded.exp) {
            return true
          }
          else return false
      }
      else return false
    }

    const storeToken = (e) => {
      localStorage.setItem("jwt", e)
      let check = checkToken()
      if(check) {
        data.isLoggedIn = true
      }
    }

    const showDialog = () => {
      let dialog = document.getElementById("dialog")
      dialog.style.visibility = "visible"
    }

    const hideDialog = () => {
      let dialog = document.getElementById("dialog")
      dialog.style.visibility = "hidden"
    }

    const logout = () => {
      localStorage.removeItem("jwt")

      let token = checkToken()

      if(!token) {
        data.isLoggedIn = false
      }
    }

    let check = checkToken()
    if(check) {
      data.isLoggedIn = true
    }


    return { data, setActivePage, storeToken, logout, submitDialog, showDialog }
  }
}
</script>

<style>

</style>
