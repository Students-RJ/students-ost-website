import adapter from '@sveltejs/adapter-node';
import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig, type Connect} from 'vite';
import express from 'express';
import {ServerResponse} from 'node:http';

export default defineConfig({
    plugins: [
        sveltekit({
            adapter: adapter()
        }),
        {
            name: 'mirror-production-static',
            // mirrors express.static('public') from server.js: files from public/
            // are served under / (e.g. /uploads/...), and /public/* 404s exactly
            // like it does in production
            configureServer(server) {
                server.middlewares.use((req: Connect.IncomingMessage, res: ServerResponse<Connect.IncomingMessage>, next: Connect.NextFunction) => {
                    if (req.url?.startsWith('/public/')) {
                        res.statusCode = 404
                        res.end()
                        return
                    }
                    next()
                })
                // express types its handler with Express' Response, Vite's
                // connect middleware expects node's ServerResponse -> cast
                server.middlewares.use(express.static('public') as Connect.NextHandleFunction)
            }
        }
    ],
    server: {
        watch: {
            usePolling: true,
            interval: 1000
        },
        host: true
    }
})
