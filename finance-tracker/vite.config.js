import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  base: "/Personal-Finance-Tracker/",
})

"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

