import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // 别名映射
    },
  },
  build: {
    rollupOptions: {
      input: {
        // 多入口配置（对应各模块）
        popup: path.resolve(__dirname, 'src/popup/index.tsx'),
        options: path.resolve(__dirname, 'src/options/index.tsx'),
        background: path.resolve(__dirname, 'src/background.ts'),
        contentScript: path.resolve(__dirname, 'src/contentScript.ts'),
      },
      output: {
        // 输出文件名与入口名一致，方便 manifest 引用
        entryFileNames: 'static/js/[name].js',
        chunkFileNames: 'static/js/[name].js',
        assetFileNames: 'static/[ext]/[name].[ext]',
      },
    },
  },
});