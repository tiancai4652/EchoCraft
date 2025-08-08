import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      // OpenAI
      "/openai": {
        target: "https://api.openai.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/openai/, ""),
      },
      // Anthropic (Claude)
      "/anthropic": {
        target: "https://api.anthropic.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/anthropic/, ""),
      },
      // DashScope (阿里通义千问)
      "/dashscope": {
        target: "https://dashscope.aliyuncs.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/dashscope/, ""),
      },
      // 百度文心（获取 token 与聊天补全都在同一域）
      "/baidu": {
        target: "https://aip.baidubce.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/baidu/, ""),
      },
      // 千帆平台（新推荐域名与授权方式）
      "/qianfan": {
        target: "https://qianfan.baidubce.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/qianfan/, ""),
      },
    },
  }
})