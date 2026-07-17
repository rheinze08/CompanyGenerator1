const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'brain_deliverables.json');
const rootOutputPath = path.join(root, 'index.html');
const outputPath = path.join(root, 'output', 'index.html');
const dependenciesPath = path.join(root, 'output', 'dependencies.json');

test('dashboard embeds the complete brain deliverables manifest', () => {
  assert.equal(fs.existsSync(rootOutputPath), true, 'root index.html must exist for GitHub Pages');
  assert.equal(fs.existsSync(outputPath), true, 'output/index.html must exist');
  const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const html = fs.readFileSync(outputPath, 'utf8');
  assert.equal(fs.readFileSync(rootOutputPath, 'utf8'), html, 'root and artifact dashboards must match');

  assert.match(html, /id="brain-data"/);
  const match = html.match(/<script id="brain-data" type="application\/json">([\s\S]*?)<\/script>/);
  assert.ok(match, 'embedded brain data script must exist');
  const embedded = JSON.parse(match[1]);

  assert.equal(embedded.files.length, source.files.length);
  assert.deepEqual(
    embedded.files.map((file) => file.path),
    source.files.map((file) => file.path),
  );
  assert.equal(embedded.files.filter((file) => file.path.startsWith('generated_documents/')).length, 590);
  assert.equal(embedded.files.filter((file) => file.path.startsWith('web_crawl/')).length, 5);
  assert.equal(embedded.files.filter((file) => file.path.startsWith('social_discovery/')).length, 3);
  assert.equal(embedded.files.filter((file) => file.path.startsWith('tools/')).length, 2);
  assert.equal(embedded.files.filter((file) => file.path.startsWith('web_tools_raw/')).length, 2);
});

test('dependency manifest names only the runtime source file', () => {
  assert.deepEqual(
    JSON.parse(fs.readFileSync(dependenciesPath, 'utf8')),
    ['brain_deliverables.json'],
  );
});

test('dashboard includes required navigation and document viewers', () => {
  const html = fs.readFileSync(outputPath, 'utf8');
  for (const label of ['Overview', 'Web crawl', 'Social discovery', 'Tool collectors', 'Documents', 'Provenance']) {
    assert.match(html, new RegExp(label));
  }
  for (const marker of ['renderMarkdown', 'renderCsv', 'renderFile', 'globalSearch', 'verifyCompleteness', 'source-detail', 'data-source-index']) {
    assert.match(html, new RegExp(marker));
  }
});
