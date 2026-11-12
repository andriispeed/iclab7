import { defineConfig } from 'vite';
import pugPlugin from 'vite-plugin-pug';

export default defineConfig({
  base: './',
  plugins: [pugPlugin({ pretty: true })],
  build: {
    rolldownOptions: {
      input: ['index.html', 'equipment.html', 'network.html', 'furniture.html', 'safety.html'],
    },
  },
});
