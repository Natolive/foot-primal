<script setup lang="ts">
// Terrain à l'échelle (68 × 105 m, 10 px par mètre) vu de dessus ; le ballon tombe et rebondit sur le point central à l'arrivée.
</script>

<template>
  <svg viewBox="0 0 680 1050" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <g fill="none" class="stroke-chalk/20" stroke-width="3">
      <rect x="20" y="20" width="640" height="1010" />
      <path d="M20 525 H660" />
      <circle cx="340" cy="525" r="91.5" />
      <!-- Surfaces de réparation, surfaces de but et arcs, en haut puis en bas. -->
      <path d="M138.5 20 V185 H541.5 V20 M248.5 20 V75 H431.5 V20 M266.9 185 A91.5 91.5 0 0 0 413.1 185" />
      <path d="M138.5 1030 V865 H541.5 V1030 M248.5 1030 V975 H431.5 V1030 M266.9 865 A91.5 91.5 0 0 1 413.1 865" />
      <path d="M20 30 A10 10 0 0 0 30 20 M650 20 A10 10 0 0 0 660 30 M660 1020 A10 10 0 0 0 650 1030 M30 1030 A10 10 0 0 0 20 1020" />
    </g>
    <g class="fill-chalk/20">
      <circle cx="340" cy="130" r="4" />
      <circle cx="340" cy="920" r="4" />
    </g>
    <circle cx="340" cy="525" r="91.5" fill="none" stroke-width="3" class="pulse stroke-chalk" />
    <ellipse cx="340" cy="546" rx="16" ry="4" class="shadow fill-footix-950/40" />
    <circle cx="340" cy="525" r="18" class="ball fill-ball" />
  </svg>
</template>

<style scoped>
.ball, .shadow, .pulse {
  transform-box: fill-box;
  transform-origin: 50% 100%;
}
.ball {
  animation: drop 1.6s cubic-bezier(.45, 0, .55, 1) .2s both;
}
.shadow {
  transform-origin: 50% 50%;
  animation: shadow 1.6s cubic-bezier(.45, 0, .55, 1) .2s both;
}
/* Onde du coup d'envoi quand le ballon se pose. */
.pulse {
  transform-origin: 50% 50%;
  opacity: 0;
  animation: pulse 1.2s ease-out 1.5s;
}

/* Chute, trois rebonds de plus en plus courts, écrasement au contact. */
@keyframes drop {
  0% { transform: translateY(-1400%); animation-timing-function: cubic-bezier(.5, 0, 1, 1); }
  38% { transform: translateY(0) scale(1.25, .75); animation-timing-function: cubic-bezier(0, 0, .5, 1); }
  58% { transform: translateY(-260%) scale(.95, 1.05); animation-timing-function: cubic-bezier(.5, 0, 1, 1); }
  74% { transform: translateY(0) scale(1.12, .88); animation-timing-function: cubic-bezier(0, 0, .5, 1); }
  86% { transform: translateY(-70%); animation-timing-function: cubic-bezier(.5, 0, 1, 1); }
  95% { transform: translateY(0) scale(1.04, .96); }
  100% { transform: translateY(0); }
}
@keyframes shadow {
  0% { transform: scale(.2); opacity: 0; }
  38%, 74%, 95%, 100% { transform: scale(1.3); opacity: 1; }
  58% { transform: scale(.6); opacity: .5; }
  86% { transform: scale(.9); opacity: .8; }
}
@keyframes pulse {
  from { transform: scale(.2); opacity: .5; }
  to { transform: scale(1.6); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .ball, .shadow, .pulse { animation: none; }
}
</style>
