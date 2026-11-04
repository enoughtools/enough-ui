import assert from 'node:assert/strict';
import { test } from 'node:test';
import worker from '../scripts/catalog-worker.mjs';

test('old domains and www permanently redirect while preserving deep links', async () => {
  for (const domain of ['ui.enoughtools.com', 'enoughui.reb.run', 'www.enoughui.com']) {
    for (const path of ['/', '/swift/?path=%2Fswift%2Fbuttons', '/?path=/catalog/card&renderer=astro', '/brand/social-preview.png']) {
      const response = await worker.fetch(new Request(`https://${domain}${path}`), { ASSETS: { fetch() { throw new Error('Aliases must redirect before serving assets'); } } });
      assert.equal(response.status, 301);
      assert.equal(response.headers.get('Location'), `https://enoughui.com${path}`);
    }
  }
});

test('the canonical domain serves the original asset request without a redirect loop', async () => {
  const request = new Request('https://enoughui.com/swift/?path=/swift/cards');
  const response = new Response('Swift gallery');
  const actual = await worker.fetch(request, { ASSETS: { fetch(received) { assert.equal(received, request); return response; } } });
  assert.equal(actual, response);
});

test('the canonical domain upgrades HTTP to HTTPS', async () => {
  const response = await worker.fetch(new Request('http://enoughui.com/swift/?path=/swift/cards'), {});
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('Location'), 'https://enoughui.com/swift/?path=/swift/cards');
});
