<template>
    <div class="login-page">
        <div class="login-card">
            <SignIn routing="virtual" />
        </div>
    </div>
</template>

<script>
import { SignIn } from "@clerk/vue";

export default {
    name: "LoginView",
    components: { SignIn },
};
</script>

<style scoped>
.login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
}

.login-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
}

.login-header {
    text-align: center;
}
</style>
