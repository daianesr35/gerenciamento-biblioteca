import { getPublicEnvironment } from '@/config/env';
import { getAuthenticatedPublicIdentifier } from '@/data/supabase/public-page';

export type PublicPageResult =
  | Readonly<{ status: 'success'; publicUrl: string }>
  | Readonly<{ status: 'error'; category: 'unavailable' }>;

export function buildPublicLibraryUrl(
  appUrl: string,
  publicIdentifier: string,
): string {
  const baseUrl = new URL(appUrl);
  const basePath = baseUrl.pathname.replace(/\/+$/, '');
  baseUrl.pathname = `${basePath}/biblioteca/${encodeURIComponent(publicIdentifier)}`;
  baseUrl.search = '';
  baseUrl.hash = '';

  return baseUrl.toString();
}

type GetIdentifier = () => Promise<string>;
type GetAppUrl = () => string;

export async function getOwnPublicPage(
  getIdentifier: GetIdentifier = getAuthenticatedPublicIdentifier,
  getAppUrl: GetAppUrl = () => getPublicEnvironment().appUrl,
): Promise<PublicPageResult> {
  try {
    const identifier = await getIdentifier();
    return {
      status: 'success',
      publicUrl: buildPublicLibraryUrl(getAppUrl(), identifier),
    };
  } catch {
    return { status: 'error', category: 'unavailable' };
  }
}
