import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // 打包输出目录
    rollupOptions: {
      // 多入口配置：弹窗页面 + 背景服务
      input: {
        main: path.resolve(__dirname, 'index.html'),
        background: path.resolve(__dirname, 'src/background/index.ts')
      },
      output: {
        // 背景服务单独输出为 background.js，方便 manifest 引用
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'background' ? 'background.js' : 'assets/[name].[hash].js';
        }
      }
    },
    assetsInlineLimit: 0, // 禁用资源内联，避免插件加载报错
    cssCodeSplit: false   // 禁用 CSS 拆分，确保样式正常加载
  },
  base: './' // 相对路径，适配 Chrome 插件的静态资源加载
});