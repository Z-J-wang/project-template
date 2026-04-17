<script setup>
import { ElButton } from 'element-plus'
import Api from '../api'

defineProps({
  msg: {
    type: String,
    required: true,
  },
})

function handlerClick() {
  Api.getProduct()
}
</script>

<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
    <h3>
      You’ve successfully created a project with
      <a href="https://vite.dev/" target="_blank" rel="noopener">Vite</a> +
      <a href="https://vuejs.org/" target="_blank" rel="noopener">Vue 3</a>.
    </h3>
    <div>
      <ElButton type="primary" @click="handlerClick">Button</ElButton>
    </div>
  </div>
</template>

<style lang="less" scoped>
h1 {
  position: relative;
  top: -10px;
  font-size: 2.6rem;
  font-weight: 500;
  color: #ffffff;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (width >=1024px) {
  .greetings h3 {
    text-align: left;
  }
}
</style>
