import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

const patchParallelJsPlugin = () => {
  return {
    name: 'patch-paralleljs',
    transform(code: string, id: string) {
      if (id.includes('paralleljs/lib/parallel.js')) {
        let newCode = code.replace(/require\(`\$\{__dirname\}\/Worker\.js`\)/g, 'self.Worker');
        newCode = newCode.replace(/require\('os'\)\.cpus\(\)\.length/g, '4');
        newCode = newCode.replace(/const isNode = !\(typeof window !== 'undefined' && this === window\);/g, 'const isNode = false;');
        return newCode;
      }
      return null;
    }
  };
};

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), patchParallelJsPlugin()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      global: 'window',
      __dirname: '""',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
