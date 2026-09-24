<script setup lang="ts">
// ponytail: redessiné d'après les PNG fournis, à remplacer par le SVG officiel s'il existe.
// Lettres en currentColor (bleu nuit sur fond clair, blanc sur fond sombre), « A » en dégradé de marque.
const id = useId()
</script>

<template>
  <svg viewBox="0 0 905 97" role="img" aria-label="Primal" class="h-auto">
    <defs>
      <linearGradient :id="id" gradientUnits="userSpaceOnUse" x1="620" y1="92" x2="740" y2="60">
        <stop offset="0" stop-color="#8a00f5" />
        <stop offset=".5" stop-color="#3b28f6" />
        <stop offset="1" stop-color="#00d6c4" />
      </linearGradient>
    </defs>
    <g fill="none" stroke-width="10" stroke-linejoin="round">
      <g stroke="currentColor">
        <path d="M0 5 H88 Q108 5 108 26.5 Q108 48 88 48 H5 V92" />
        <path d="M205 5 H293 Q313 5 313 26.5 Q313 48 293 48 H210 V92 M272 48 L313 92" />
        <path d="M398 5 V92" />
        <path d="M475 92 V8 L522 72 L569 8 V92" />
        <path d="M825 5 V80 Q825 87 833 87 H905" />
      </g>
      <path :stroke="`url(#${id})`" d="M656 5 H684 L738 92 M676 55 H646 L623 92" />
    </g>
  </svg>
</template>
