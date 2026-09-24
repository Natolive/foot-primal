<script setup lang="ts">
// Lettres en currentColor, le point du « i » est le ballon : il saute quand on survole le lien qui contient le logo.
</script>

<template>
  <svg viewBox="-8 0 294 88" role="img" aria-label="Footix" class="h-auto overflow-visible">
    <g fill="none" stroke="currentColor" stroke-width="13" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 80 V27 A19 19 0 0 1 27 8 H32 M-1 40 H29" />
      <circle cx="68" cy="58" r="22" />
      <circle cx="126" cy="58" r="22" />
      <path d="M176 14 V64 A16 16 0 0 0 192 80 H196 M164 40 H194" />
      <path d="M220 40 V80" />
      <path d="M242 40 L278 80 M278 40 L242 80" />
    </g>
    <circle cx="220" cy="13" r="9.5" class="ball fill-ball" />
  </svg>
</template>

<style scoped>
.ball {
  transform-box: fill-box;
  transform-origin: 50% 100%;
}
a:hover .ball,
a:focus-visible .ball {
  animation: hop .6s cubic-bezier(.3, 0, .3, 1);
}
@keyframes hop {
  0%, 100% { transform: translateY(0) scale(1); }
  15% { transform: translateY(0) scale(1.15, .8); }
  50% { transform: translateY(-45%) scale(.95, 1.05); }
  85% { transform: translateY(0) scale(1.1, .85); }
}

@media (prefers-reduced-motion: reduce) {
  a:hover .ball, a:focus-visible .ball { animation: none; }
}
</style>
