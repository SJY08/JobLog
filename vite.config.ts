import path from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "src"),
        },
    },
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            disable: false,
            registerType: "autoUpdate",

            devOptions: {
                enabled: true,
            },

            includeAssets: [
                "icons/favicon.ico",
                "icons/icon-192.png",
                "icons/icon-512.png",
                "splash/apple-touch-icon.png",
            ],

            manifest: {
                name: "JobLog",
                short_name: "JobLog",
                start_url: "/",
                theme_color: "#000000",
                background_color: "#ffffff",
                display: "standalone",
                icons: [
                    {
                        src: "icons/icon-192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "icons/icon-512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable",
                    },
                ],
            },
        }),
    ],
})
