<script setup lang="ts">
// Le « A » du logo Primal, isolé et agrandi comme élément graphique.
const id = useId()
</script>

<template>
  <svg viewBox="0 0 150 100" aria-hidden="true" class="mark">
    <defs>
      <linearGradient :id="id" gradientUnits="userSpaceOnUse" x1="20" y1="95" x2="140" y2="60">
        <stop offset="0" stop-color="#8a00f5" />
        <stop offset=".5" stop-color="#3b28f6" />
        <stop offset="1" stop-color="#00d6c4" />
      </linearGradient>
      <filter :id="`${id}-glow`" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8" />
      </filter>
    </defs>
    <g fill="none" :stroke="`url(#${id})`" stroke-width="10" stroke-linejoin="round">
      <g :filter="`url(#${id}-glow)`" class="glow">
        <path d="M56 5 H84 L138 92" />
        <path d="M76 55 H46 L23 92" />
      </g>
      <path d="M56 5 H84 L138 92" pathLength="1" class="stroke" />
      <path d="M76 55 H46 L23 92" pathLength="1" class="stroke late" />
    </g>
  </svg>
</template>

<style scoped>
.mark {
  overflow: visible;
}
.stroke {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: draw 1.4s cubic-bezier(.6, 0, .2, 1) .3s forwards;
}
.late {
  animation-delay: 1.1s;
}
.glow {
  opacity: 0;
  animation: glow 1.2s ease-out 2s forwards;
}
@keyframes draw { to { stroke-dashoffset: 0; } }
@keyframes glow { to { opacity: .45; } }

@media (prefers-reduced-motion: reduce) {
  .stroke, .glow {
    animation: none;
    stroke-dashoffset: 0;
    opacity: .45;
  }
  .stroke { opacity: 1; }
}
</style>
