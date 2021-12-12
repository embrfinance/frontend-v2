<template>
  <div :class="ripple"><div></div><div></div></div>
</template>
<script>
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'BalLoadingIcon',

  props: {
    color: {
      type: String,
      default: 'gray',
      validator: value => ['gray', 'primary', 'white'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: value => ['xs', 'sm', 'md', 'lg'].includes(value)
    }
  },

  setup(props) {
    const sizeClasses = computed(() => {
      switch (props.size) {
        case 'lg':
          return 'lg';
        case 'sm':
          return 'sm';
        case 'xs':
          return 'xs';
        default:
          return 'md';
      }
    });

    const colorClasses = computed(() => {
      switch (props.color) {
        case 'white':
          return 'bg-white dark:bg-opacity-50';
        case 'gray':
          return 'bg-gray-400 dark:bg-gray-500';
        default:
          return `bg-${props.color}-500`;
      }
    });

    return {
      sizeClasses,
      colorClasses
    };
  }
});
</script>

<style scoped>
.spinner {
  position: relative;
}

.xs {
  width: 12px;
  height: 12px;
}

.sm {
  width: 16px;
  height: 16px;
}

.md {
  width: 22px;
  height: 22px;
}

.lg {
  width: 32px;
  height: 32px;
}
/*
.double-bounce1,
.double-bounce2 {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  opacity: 0.6;
  position: absolute;
  top: 0;
  left: 0;
  -webkit-animation: sk-bounce 2s infinite ease-in-out;
  animation: sk-bounce 2s infinite ease-in-out;
  background: green !important;
}
.double-bounce2 {
  -webkit-animation-delay: -1s;
  animation-delay: -1s;
  background: lawngreen !important;
}
@-webkit-keyframes sk-bounce {
  0%,
  100% {
    -webkit-transform: scale(0);
  }
  50% {
    -webkit-transform: scale(1);
  }
}
@keyframes sk-bounce {
  0%,
  100% {
    transform: scale(0);
    -webkit-transform: scale(0);
  }
  50% {
    transform: scale(1);
    -webkit-transform: scale(1);
  }
}*/

.ripple {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.ripple div {
  position: absolute;
  border: 4px solid #fff;
  opacity: 1;
  border-radius: 50%;
  animation: ripples 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}
.ripple div:nth-child(2) {
  animation-delay: -0.5s;
}
@keyframes ripples {
  0% {
    top: 36px;
    left: 36px;
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    top: 0px;
    left: 0px;
    width: 72px;
    height: 72px;
    opacity: 0;
  }
}

</style>
