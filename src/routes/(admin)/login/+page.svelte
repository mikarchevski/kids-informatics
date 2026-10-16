<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form?: ActionData } = $props();
</script>

<div class="login-container">
	<div class="login-card">
		<h1>Вход в админку</h1>

		{#if form?.error}
			<div class="alert alert-error">{form.error}</div>
		{/if}

		<form method="POST" action="?/login" class="login-form">
			<div class="form-group">
				<label for="email">Email</label>
				<input
					id="email"
					name="email"
					type="email"
					required
					autocomplete="username"
					class="form-input"
					placeholder="admin@example.com"
				/>
			</div>

			<div class="form-group">
				<label for="password">Пароль</label>
				<input
					id="password"
					name="password"
					type="password"
					required
					autocomplete="current-password"
					class="form-input"
				/>
			</div>

			<button type="submit" class="btn btn-primary btn-block">Войти</button>
		</form>
	</div>
</div>

<style src="./login.css"></style>
