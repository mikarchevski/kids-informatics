import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import adapter from '@sveltejs/adapter-node';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter({
        out: 'build'
      })
    })
  ],
  resolve: {
    alias: {
      '#lib': fileURLToPath(new URL('./src/lib', import.meta.url))
    }
  }
});
