const aliases = new Set(['ui.enoughtools.com', 'enoughui.reb.run', 'www.enoughui.com']);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (aliases.has(url.hostname) || (url.hostname === 'enoughui.com' && url.protocol !== 'https:')) {
      url.protocol = 'https:';
      url.hostname = 'enoughui.com';
      url.port = '';
      return Response.redirect(url.href, 301);
    }
    return env.ASSETS.fetch(request);
  },
};
