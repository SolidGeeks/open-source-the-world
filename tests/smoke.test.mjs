// SPDX-License-Identifier: AGPL-3.0-or-later
// Smoke test: the game boots, a session starts, the player moves, a breach is played to its end, every crew member
// talks, the overlays open and close, and touch controls show on a phone, all without a JavaScript error.
// Run with: npm test (needs a browser once: npx playwright install chromium)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const url = pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html')).href;
let browser;

// The game loop catches its own errors and logs them with console.error, so watch the console as well as crashes.
// Fonts come from Google Fonts: a failed font request is not an error of the game.
async function open(options = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, ...options });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)\.com|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.goto(url);
  await page.waitForFunction(() => window.__osw);
  return { ctx, page, errors };
}
const state = page => page.evaluate(() => window.__osw.state);
async function newSession(page) {
  await page.locator('#tNew').waitFor({ state: 'visible', timeout: 15000 });
  await page.locator('#tNew').click();
  await page.waitForFunction(() => ['play', 'dialog'].includes(window.__osw.state));
  // Term greets newcomers; close that first dialog
  await page.waitForTimeout(900);
  if (await state(page) === 'dialog') await page.keyboard.press('Escape');
  await page.waitForFunction(() => window.__osw.state === 'play');
}

before(async () => { browser = await chromium.launch(); });
after(async () => { await browser?.close(); });

test('the title screen boots without errors', async () => {
  const { ctx, page, errors } = await open();
  await page.locator('#tNew').waitFor({ state: 'visible', timeout: 15000 });
  assert.match(await page.title(), /Open Source the World/);
  assert.ok(await page.evaluate(() => window.__osw.NODES.length) > 20, 'the world has nodes');
  assert.match(await page.locator('#boot').innerText(), /7 online/);
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('a session starts, the player moves, and a breach plays to its end', async () => {
  const { ctx, page, errors } = await open();
  await newSession(page);
  const start = await page.evaluate(() => ({ x: window.__osw.P.x, y: window.__osw.P.y }));
  for (const k of ['KeyD', 'KeyS', 'KeyA']) { await page.keyboard.down(k); await page.waitForTimeout(500); await page.keyboard.up(k); }
  const moved = await page.evaluate(s => Math.hypot(window.__osw.P.x - s.x, window.__osw.P.y - s.y), start);
  assert.ok(moved > 20, `the player moves (${Math.round(moved)} px)`);

  // Breach the nearest ordinary node, picking from the highlighted line until the breach ends
  await page.evaluate(() => { const { NODES, P, openBreach } = window.__osw; const n = NODES.filter(n => !n.core && !n.open).sort((a, b) => Math.hypot(a.x * 48 - P.x, a.y * 48 - P.y) - Math.hypot(b.x * 48 - P.x, b.y * 48 - P.y))[0]; openBreach(n); });
  assert.equal(await state(page), 'breach');
  assert.ok(await page.locator('#breach').isVisible());
  for (let i = 0; i < 12 && !(await page.evaluate(() => window.__osw.bp?.over)); i++) {
    const cell = page.locator('#bpGrid .cell.on').first();
    if (!(await cell.count())) break;
    await cell.click();
  }
  assert.ok(await page.evaluate(() => window.__osw.bp?.over), 'the breach ends');
  await page.waitForFunction(() => window.__osw.state === 'play', null, { timeout: 5000 });
  assert.ok(!(await page.locator('#breach').isVisible()), 'the breach overlay closes');
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('every crew member talks', async () => {
  const { ctx, page, errors } = await open();
  await newSession(page);
  for (const id of ['term', 'rep', 'brax', 'bit', 'null', 'atlas', 'brick']) {
    await page.evaluate(id => window.__osw.talk(id), id);
    assert.equal(await state(page), 'dialog', id);
    await page.waitForTimeout(400);
    assert.ok((await page.locator('#dName').innerText()).length > 0, `${id} has a name`);
    await page.keyboard.press('Escape');
    assert.equal(await state(page), 'play', `${id}: the dialog closes`);
  }
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('the map, the upgrades and the pause menu open and close', async () => {
  const { ctx, page, errors } = await open();
  await newSession(page);
  for (const [key, panel, closeKey] of [['KeyM', '#mapOv', 'KeyM'], ['Tab', '#shop', 'Tab'], ['Escape', '#pause', 'Escape']]) {
    await page.keyboard.press(key);
    await page.waitForTimeout(300);
    assert.ok(await page.locator(panel).isVisible(), `${panel} opens`);
    await page.keyboard.press(closeKey);
    await page.waitForTimeout(200);
    assert.ok(!(await page.locator(panel).isVisible()), `${panel} closes`);
    assert.equal(await state(page), 'play');
  }
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('on a phone, touch controls show', async () => {
  const { ctx, page, errors } = await open({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await newSession(page);
  assert.ok(await page.locator('#touch').isVisible(), 'the stick and buttons are shown');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(overflow <= 1, `no sideways scroll (${overflow}px)`);
  assert.deepEqual(errors, []);
  await ctx.close();
});
