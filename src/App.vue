<template>
  <div id="app">
    <TopPanel></TopPanel>
    <LeftPanel></LeftPanel>
    <RightPanel></RightPanel>
    <MainCanvas></MainCanvas>
  </div>
</template>

<script>
import LeftPanel from "./components/LeftPanel";
import RightPanel from "./components/RightPanel";
import TopPanel from "./components/TopPanel";
import MainCanvas from "./components/MainCanvas";
import store from "./store/store";

export default {
  name: "App",
  data: function() {
    return { store };
  },
  created: function() {
    this.store.createPath();
  },
  components: {
    LeftPanel,
    RightPanel,
    TopPanel,
    MainCanvas
  }
};
</script>

<style>
html, body {
  height: 100%;
  color: #333;
  letter-spacing: 0.05em;
  font-size: 14px;
}

#app {
  background-color: #222;
  height: 100%;
}
</style>
