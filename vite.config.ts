const { defineConfig, loadEnv } = require('vite');
const react = require('@vitejs/plugin-react');
// FIX: The 'process' object is globally available in Node.js, so this declaration is not needed and causes a redeclaration error.

// https://vitejs.dev/config/
module.exports = defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // API key is no longer exposed to the client.
      // It will be accessed securely in the serverless function.
    }
  }
});