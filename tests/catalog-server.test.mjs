import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { get } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { createCatalogServer } from '../scripts/catalog-server.mjs';

test('catalog server serves assets and directory indexes while refusing paths outside its root', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'enough-ui-server-'));
  const root = join(directory, 'catalog');
  await mkdir(join(root, 'nested'), { recursive: true });
  await writeFile(join(root, 'index.html'), '<h1>Catalog</h1>');
  await writeFile(join(root, 'nested/index.html'), '<h1>Nested catalog</h1>');
  await writeFile(join(root, 'entry.js'), 'export const catalog = true;');
  await writeFile(join(directory, 'private.txt'), 'must not be served');
  await symlink(join(directory, 'private.txt'), join(root, 'outside-file'));
  await symlink(directory, join(root, 'outside-directory'));
  const server = createCatalogServer(root);
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  const request = (path) => new Promise((done, reject) => {
    get({ hostname: '127.0.0.1', port: server.address().port, path }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('error', reject);
      response.on('end', () => done({ status: response.statusCode, headers: response.headers, body: Buffer.concat(chunks).toString() }));
    }).on('error', reject);
  });
  try {
    for (const path of ['/', '/?path=/catalog/button', '/index.html']) {
      const response = await request(path);
      assert.equal(response.status, 200, path);
      assert.equal(response.body, '<h1>Catalog</h1>');
      assert.equal(response.headers['content-type'], 'text/html');
    }
    for (const path of ['/nested', '/nested/']) {
      assert.equal((await request(path)).body, '<h1>Nested catalog</h1>');
    }
    const script = await request('/entry.js');
    assert.equal(script.status, 200);
    assert.equal(script.headers['content-type'], 'text/javascript');
    assert.equal(script.headers['x-content-type-options'], 'nosniff');
    assert.equal(script.body, 'export const catalog = true;');
    assert.equal((await request('/missing')).status, 404);
    assert.equal((await request('/%zz')).status, 400);
    for (const path of ['/%2e%2e%2fprivate.txt', '/outside-file', '/outside-directory/private.txt']) {
      const response = await request(path);
      assert.equal(response.status, 403, path);
      assert.ok(!response.body.includes('must not be served'));
    }
    assert.equal((await request('/entry.js')).status, 200, 'Rejected requests must leave the server usable.');
  } finally {
    await new Promise((done) => server.close(done));
    await rm(directory, { recursive: true, force: true });
  }
});
