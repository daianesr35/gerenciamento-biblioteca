import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { notFound } from 'next/navigation';

const allowedImages = new Set([
  'dashboard-home',
  'login',
  'login-biblioteca',
  'pagina-publica',
]);

export async function GET(
  _request: Request,
  context: { params: Promise<{ name: string }> },
) {
  const { name } = await context.params;
  if (!allowedImages.has(name)) {
    notFound();
  }

  const imagePath = path.join(
    process.cwd(),
    'docs',
    'design',
    'imagens',
    `${name}.png`,
  );
  const image = await readFile(imagePath);

  return new Response(image, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'image/png',
    },
  });
}
