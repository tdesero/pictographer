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
  components: {
    LeftPanel,
    RightPanel,
    TopPanel,
    MainCanvas
  }
};
</script>

<style>
</style>
