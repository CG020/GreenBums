import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  base: '/GreenBums/',
  build: {
    outDir: '../dist',
    minify: false,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './src/index.html'
      }
    }
  },
  server: {
    port: 5173, // this number had to change from the default now its this number !! 
    // this is the server port number for vite this is how it can get to the aws database
    proxy: {
      '/api': {
        target: 'https://job1zh9fxh.execute-api.us-east-2.amazonaws.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/v1')
      }
    },
    cors: true
  }
});