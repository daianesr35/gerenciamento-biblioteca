import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { describe, expect, it } from 'vitest';

import { config } from './proxy';

function matchesProxy(pathname: string): boolean {
  return unstable_doesMiddlewareMatch({
    config,
    url: `https://example.com${pathname}`,
  });
}

describe('matcher do Proxy', () => {
  it.each([
    '/_next/static/chunk.js',
    '/_next/image',
    '/favicon.ico',
    '/sitemap.xml',
    '/robots.txt',
    '/reference-image/login',
    '/images/capa.webp',
    '/fonts/app.woff2',
  ])('não intercepta recurso estático %s', (pathname) => {
    expect(matchesProxy(pathname)).toBe(false);
  });

  it.each(['/', '/login', '/dashboard', '/biblioteca'])(
    'intercepta rota de aplicação %s',
    (pathname) => {
      expect(matchesProxy(pathname)).toBe(true);
    },
  );
});
