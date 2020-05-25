<template>
    <div class="shape-modal">
        <button
            @click="open = true"
            class="btn btn-primary btn btn-primary btn-circle btn-xl"
            title="btnTitle"
            >
            <slot name="icon"></slot>
        </button>

        <div 
            class="modal-container"
            :class="{open: open}"
        >
            <div class="overlay" @click="open = false"></div>
            <div class="modal-content">
                <span class="float-right modal-close" @click="open = false">&times;</span>
                <h3>{{ modalTitle }}</h3>
                <slot name="content">
                </slot>
                <button @click="confirm" class="btn btn-primary">Okay</button>
            </div>
        </div>
    </div>
</template>

<script>

export default {
  name: "ShapeModal",
  props: {
      modalTitle: String,
      btnTitle: String
  },
  data: function() {
      return {
          open: false,
      }
  },
  methods: {
      confirm: function() {
          this.open = false;
          this.$emit('confirm');
      }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.shape-modal {
  pointer-events: auto;
}

.btn-circle {
  margin-bottom: 1rem;
  pointer-events: auto;
  transition: .3s transform;
}

.btn-circle:hover {
  transform: translate(4px, 0);
}

.modal-content {
    position: relative;
    max-width: 500px;
    top: 25%;
}
</style>