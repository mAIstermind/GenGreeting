import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
// FIX: Import 'process' to provide correct type definitions for the Node.js process object.
import process from 'process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    // FIX: Removed inline PostCSS config as postcss.config.js is present and used by Vite automatically.
    // This resolves the TypeScript type error and avoids configuration duplication.
    define: {
      // API key is no longer exposed to the client.
      // It will be accessed securely in the serverless function.
    }
  }
})
