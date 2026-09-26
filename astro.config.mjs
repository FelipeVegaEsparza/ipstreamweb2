// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  site: process.env.SITE_URL || 'https://ipstream.cl',
  output: 'server',
  // Detras de un proxy TLS (Traefik/Dokploy) el `Origin` del navegador es https
  // pero el adapter Node calcula url.origin como http, y el chequeo falla.
  // Las mutaciones del admin ya validan un token CSRF ligado a la sesion.
  security: { checkOrigin: false },
  adapter: node({ mode: 'standalone' }),
  server: {
    port: Number(process.env.PORT) || 4321,
    host: true,
  },
});
