<script setup>
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/vue'
</script>

<template>
    <main class="landing">
        <section class="card">
            <h1 style="text-align: center;">Welcome to EMM Sandbox</h1>

            <SignedOut>
                <div style="display:flex; gap:12px; justify-content:center; margin-top:16px;">
                    <SignInButton mode="modal">
                        <button>Sign in</button>
                    </SignInButton>
                </div>
            </SignedOut>

            <SignedIn>
                <div style="display:flex; gap:12px; justify-content:center; align-items:center; margin-top:16px;">
                    <span>You are signed in</span>
                    <UserButton />
                </div>
            </SignedIn>
        </section>
    </main>
</template>