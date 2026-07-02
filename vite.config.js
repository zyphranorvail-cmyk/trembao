import { defineConfig } from 'vite';
import { resolve } from 'path';
export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                checkout: resolve(__dirname, 'checkout/index.html'),
                reclamacao: resolve(__dirname, 'reclamacao/index.html'),
            },
        },
    },
    server: {
        port: 3000,
        open: true,
    },
});