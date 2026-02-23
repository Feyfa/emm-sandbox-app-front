<template>
  <main class="landing">
    <section class="card">
      <h1>Welcome to EMM Sandbox</h1>
      <p>
        Vue 3 frontend is running. This is a simple landing page without Auth0
        integration.
      </p>
    </section>
  </main>
</template>

<style scoped>
:global(html),
:global(body),
:global(#app) {
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.landing {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.card {
  width: min(680px, 100%);
  text-align: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

h1 {
  margin: 0 0 12px;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  color: #0f172a;
}

p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}
</style>