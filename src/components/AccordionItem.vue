<template>
    <div class="accordion-item" :class="{open: isOpen}">
        <div 
            @click="isOpen = !isOpen" 
            class="accordion-btn text-uppercase text-bold">
            {{title}}
        </div>
        <div class="accordion-content-wrapper">
            <div class="accordion-content">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>

export default {
  name: "AccordionItem",
  props: {
      title: String,
      open: Boolean,
  },
  data: function() {
      return {
          isOpen: this.open || false,
      }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.accordion-item .accordion-btn {
  color: #888;
  letter-spacing: 0.1em;
}

</style>