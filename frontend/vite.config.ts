import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * MineSetu AI — Vite Local API Gateway Plugin
 * Routes /api/v1/* directly to backend TypeScript handlers with Vercel serverless request/response semantics.
 */
function apiGatewayPlugin(): Plugin {
  return {
    name: 'minesetu-api-gateway',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/v1')) {
          return next()
        }

        try {
          const url = new URL(req.url, 'http://localhost:5173')
          const pathname = url.pathname

          let handlerFile = ''
          let routeAction = ''

          if (pathname.startsWith('/api/v1/auth/')) {
            handlerFile = path.resolve(__dirname, '../backend/functions/api/v1/auth/[action].ts')
            routeAction = pathname.replace('/api/v1/auth/', '')
          } else if (pathname === '/api/v1/documents') {
            handlerFile = path.resolve(__dirname, '../backend/functions/api/v1/documents.ts')
          } else if (pathname === '/api/v1/manual-records') {
            handlerFile = path.resolve(__dirname, '../backend/functions/api/v1/manual-records.ts')
          } else if (pathname === '/api/v1/query') {
            handlerFile = path.resolve(__dirname, '../backend/functions/api/v1/query.ts')
          } else if (pathname === '/api/v1/reports') {
            handlerFile = path.resolve(__dirname, '../backend/functions/api/v1/reports.ts')
          } else if (pathname === '/api/v1/requests') {
            handlerFile = path.resolve(__dirname, '../backend/functions/api/v1/requests.ts')
          } else if (pathname === '/api/v1/reviews') {
            handlerFile = path.resolve(__dirname, '../backend/functions/api/v1/reviews.ts')
          } else if (pathname === '/api/v1/connectors') {
            handlerFile = path.resolve(__dirname, '../backend/functions/api/v1/connectors.ts')
          } else {
            res.statusCode = 404
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: false, error: `API route not found: ${pathname}` }))
            return
          }

          const queryParams: Record<string, string> = {}
          url.searchParams.forEach((val, key) => {
            queryParams[key] = val
          })
          if (routeAction) {
            queryParams.action = routeAction
          }

          let body: any = {}
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '')) {
            const chunks: Buffer[] = []
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
            }
            const rawBody = Buffer.concat(chunks).toString('utf-8')
            if (rawBody.trim()) {
              try {
                body = JSON.parse(rawBody)
              } catch {
                body = rawBody
              }
            }
          }

          const mod = await server.ssrLoadModule(handlerFile)
          const handler = mod.default?.default || mod.default

          if (typeof handler !== 'function') {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: false, error: 'Handler not callable' }))
            return
          }

          const vercelReq = Object.assign(req, {
            query: queryParams,
            body,
            cookies: {},
          })

          let ended = false
          const vercelRes = Object.assign(res, {
            status(code: number) {
              res.statusCode = code
              return vercelRes
            },
            json(data: any) {
              if (ended) return vercelRes
              ended = true
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(data))
              return vercelRes
            },
            send(data: any) {
              if (ended) return vercelRes
              ended = true
              res.end(data)
              return vercelRes
            },
          })

          await handler(vercelReq, vercelRes)
        } catch (err: any) {
          console.error('[Vite API Gateway Error]', err)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: false, error: err?.message || 'Internal server error' }))
          }
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiGatewayPlugin()],
  server: {
    port: 5173,
    host: true,
  },
})
