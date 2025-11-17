import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [ react(), tailwind() ],
  define: {
    // Ensure environment variables are properly defined
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:5000'),
  },
  server: {
    port: 5173,
    host: true, // Allow external connections
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps in production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          clerk: ['@clerk/clerk-react'],
        },
      },
    },
  },
  preview: {
    port: 4173,
    host: true,
  },
});
