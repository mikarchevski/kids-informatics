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

<style>
	.login-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f8f9fa;
		padding: 1rem;
	}
	.login-card {
		background: white;
		padding: 2.5rem;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 400px;
	}
	h1 {
		text-align: center;
		margin-bottom: 1.5rem;
		color: #2c3e50;
		font-size: 1.5rem;
	}
	.form-group {
		margin-bottom: 1.25rem;
	}
	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: #495057;
	}
	.form-input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}
	.form-input:focus {
		outline: none;
		border-color: #3498db;
		box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
	}
	.btn-block {
		width: 100%;
		padding: 0.75rem;
		font-size: 1rem;
		margin-top: 0.5rem;
	}
	.alert-error {
		background: #f8d7da;
		color: #721c24;
		padding: 0.75rem;
		border-radius: 6px;
		margin-bottom: 1rem;
		text-align: center;
	}
</style>
