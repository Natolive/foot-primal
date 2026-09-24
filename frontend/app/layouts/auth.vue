<template>
  <main class="grid min-h-dvh lg:grid-cols-[1.15fr_1fr]">
    <!-- Bandeau de marque sur grand écran uniquement : en dessous, le logo seul au-dessus du formulaire. -->
    <section class="brand relative isolate hidden flex-col justify-end overflow-hidden p-14 lg:flex lg:min-h-dvh">
      <BrandMark class="absolute -right-[12%] -bottom-[8%] -z-10 h-[85%]" />
      <BrandLogo class="text-chalk absolute top-14 left-14 w-56" />
      <h2 class="font-display text-chalk mt-16 max-w-[10ch] text-8xl leading-[.85] font-black uppercase xl:text-9xl">
        Le terrain t'attend
      </h2>
      <p class="text-chalk/80 mt-5 max-w-sm text-base">
        Repère un créneau, réserve ta place, on se retrouve sur le terrain.
      </p>
    </section>

    <section class="flex items-center justify-center px-4 py-12 sm:px-10">
      <div class="w-full max-w-sm">
        <BrandLogo class="text-highlighted mb-12 w-40 lg:hidden" />
        <slot />
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Bleu nuit des lettres du logo. */
.brand {
  background: var(--color-ink);
}
</style>
