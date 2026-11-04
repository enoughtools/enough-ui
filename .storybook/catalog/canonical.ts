export function updateCanonicalURL(section: 'catalog' | 'swift', slug: string) {
  const url = new URL(section === 'swift' ? '/swift/' : '/', 'https://enoughui.com');
  if (slug) url.searchParams.set('path', `/${section}/${slug}`);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', url.href);
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', url.href);
}
