<script setup>
import { ref } from 'vue';

const isVisible = ref(false);
const message = ref("Content copied!");

const showNotification = () => {
  isVisible.value = true;
  setTimeout(() => {
    isVisible.value = false;
  }, 2000);
};

defineExpose({
  showNotification,
});
</script>

<template>
    <Transition>
        <div v-if="isVisible">
            {{ message }}
        </div>
    </Transition>
</template>

<style>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
