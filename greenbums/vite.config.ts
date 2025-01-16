import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
  const isProduction = command === 'build';
  
  return {
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
      port: 5173,
      proxy: {
        '/api': {
          target: 'https://job1zh9fxh.execute-api.us-east-2.amazonaws.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, '/v1')
        }
      },
      cors: true
    },
    define: {
      __API_URL__: isProduction 
        ? JSON.stringify('https://job1zh9fxh.execute-api.us-east-2.amazonaws.com/v1')
        : JSON.stringify('/api')
    }
  }
});