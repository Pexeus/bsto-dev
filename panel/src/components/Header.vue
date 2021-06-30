<template>
  <div class="-header">
      <div class="-header-left">
          <h2>Neoflix Admin</h2>
      </div>
      <div class="-header-right">
          <p @click="update(0)" id=0>Shows</p>
          <p @click="update(1)" id=1>Queue</p>
          <p @click="update(2)" id=2>Users</p>
          <p @click="update(3)" id=3>Activity</p>
          <b @click="logout()">Logout</b>
      </div>
  </div>
</template>

<script>
import { reactive } from "vue"
export default {
  name: 'Header',
  props: {
    pageActive: Number,
    dialog: Boolean
  },
  setup(props, context) {
      let elems = document.getElementsByTagName("p")

      const update = (id) => {
        // change underlined elem in header
        for(let elem of elems) {
          if(elem.id == id) {
            elem.style.textDecoration = "underline"
          }
          else { 
            elem.style.textDecoration = "none"
          }
        }
        // emit pageChanged event
        context.emit("pageChanged", id)
      }

      const logout = () => {
        context.emit("showDialog")
      }

      setTimeout(() => {
        update(props.pageActive)
      },10)



      return { update, logout }
  }
}
</script>

<style>
b { 
  cursor:pointer;
  color:#ac274f;
}
</style>
