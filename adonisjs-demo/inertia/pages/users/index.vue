<script setup lang="ts">
import { Link, Head } from '@inertiajs/vue3';

type SerializedUser = {
    name: string;
    email: string;
    id: string;
}

defineProps<{
  users: SerializedUser[]
}>()
</script>

<template>
  <Head title="Users" />

  <div v-for="user in users" :key="user.id">
    <Link :href="`/users/${user.id}`">
      {{ user.name }}
    </Link>
    <div>{{ user.email }}</div>
  </div>
</template>
