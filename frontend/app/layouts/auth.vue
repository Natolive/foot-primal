<template>
  <main class="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
    <!-- Terrain sur grand écran uniquement : en dessous, le logo seul au-dessus du formulaire. -->
    <section class="pitch relative isolate hidden flex-col justify-end overflow-hidden p-14 lg:flex lg:min-h-dvh">
      <BrandPitch class="absolute inset-0 -z-10 size-full" />
      <BrandLogo class="text-chalk absolute top-14 left-14 w-40" />
      <h2 class="font-display text-chalk max-w-[12ch] text-6xl leading-[1.02] font-bold tracking-tight xl:text-7xl">
        Le terrain t'attend.
      </h2>
      <p class="text-chalk/80 mt-6 max-w-sm text-lg">
        Repère un créneau, réserve ta place, on se retrouve sur le terrain.
      </p>
    </section>

    <section class="flex items-center justify-center px-4 py-12 sm:px-10">
      <div class="w-full max-w-sm">
        <BrandLogo class="text-highlighted mb-12 w-32 lg:hidden" />
        <slot />
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Pelouse sous les projecteurs : plus claire au rond central. */
.pitch {
  background: radial-gradient(80% 55% at 50% 50%, var(--color-footix-300), var(--color-footix-500) 75%);
}
</style>
