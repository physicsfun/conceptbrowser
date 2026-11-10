import {test,expect} from '@playwright/test';
async function explore(page){await page.goto('/');await page.getByRole('button',{name:'Explore',exact:true}).click()}
async function noOverflow(page){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}
for(const width of [1440,1024,768,390]){
 test(`readable Browse and Explore at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:1000});await page.goto('/');await noOverflow(page);
  expect(await page.locator('.hero p').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
  expect(await page.locator('.nav-item').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(14);
  await page.screenshot({path:`/tmp/readability-home-${width}.png`,fullPage:true,animations:'disabled'});
  await page.getByRole('button',{name:'Explore',exact:true}).click();await noOverflow(page);
  expect(await page.locator('.relation-card span').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(15);
  expect(await page.locator('.layout-selector select').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(14);
  await page.getByLabel('YOUR PERSPECTIVE').selectOption('radial2');await page.getByRole('button',{name:'Overview mode',exact:true}).click();
  await expect(page.locator('.graph-node')).toHaveCount(44);await noOverflow(page);
  const strong=page.locator('.graph-node[aria-pressed=true] strong');
  const screenFont=await strong.evaluate(el=>parseFloat(getComputedStyle(el).fontSize)*(el.getBoundingClientRect().height/el.offsetHeight));expect(screenFont).toBeGreaterThanOrEqual(13.5);
  await page.screenshot({path:`/tmp/readability-explore-${width}.png`,fullPage:true,animations:'disabled'});
 });
}
test('overview markers expose readable labels on hover and keyboard focus',async({page})=>{
 await explore(page);await page.getByRole('button',{name:'Overview mode',exact:true}).click();
 for(let i=0;i<6;i++)await page.getByRole('button',{name:'Zoom out',exact:true}).click();
 const marker=page.locator('.graph-node.marker-only').filter({visible:true}).first();
 // Use the native keyboard path even for a node outside the clipped viewport.
 await marker.focus();await expect(marker.locator('strong')).toBeVisible();
 expect(await marker.locator('strong').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(14);
});
test('fullscreen preserves exploration, changes layouts, fits and resets',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await explore(page);
 await page.getByRole('button',{name:'Reveal another layer',exact:true}).click();const count=await page.locator('.graph-toolbar').textContent();
 await page.getByRole('button',{name:'Fullscreen',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Fullscreen concept explorer'});await expect(dialog).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>!!document.fullscreenElement)).toBe(true);
 await expect(page.getByRole('button',{name:'Exit fullscreen'})).toBeFocused();
 await page.getByRole('combobox',{name:'Fullscreen visualization'}).selectOption('radial2');await expect(page.locator('.graph-node[aria-pressed=true] strong')).toHaveText('Electric Field');
 await page.getByRole('button',{name:'Fit view',exact:true}).click();await noOverflow(page);await page.screenshot({path:'/tmp/readability-fullscreen2.png',fullPage:false,animations:'disabled'});
 await page.getByRole('combobox',{name:'Fullscreen visualization'}).selectOption('radial3');await expect(page.locator('.spatial-badge')).toContainText('READY');await page.getByRole('button',{name:'Fit view',exact:true}).click();
 await page.screenshot({path:'/tmp/readability-fullscreen3.png',fullPage:false,animations:'disabled'});
 await page.getByRole('button',{name:'Exit fullscreen'}).click();await expect(dialog).toHaveCount(0);await expect(page.locator('.graph-toolbar')).toHaveText(count);await expect(page.getByRole('button',{name:'Fullscreen',exact:true})).toBeFocused();
 await page.getByRole('button',{name:'Fullscreen',exact:true}).click();await page.getByRole('button',{name:'Reset',exact:true}).click();await expect(page.locator('.spatial-label.selected')).toHaveText('Electric Field');await page.evaluate(()=>{document.exitFullscreen()});await expect(dialog).toHaveCount(0);
});
test('mobile fullscreen fallback exits with Escape and keeps layout selection',async({page})=>{
 await page.addInitScript(()=>{Element.prototype.requestFullscreen=undefined});await page.setViewportSize({width:390,height:844});await explore(page);
 await page.getByRole('button',{name:'Fullscreen',exact:true}).click();await expect(page.getByRole('dialog',{name:'Fullscreen concept explorer'})).toBeVisible();await noOverflow(page);
 await page.getByRole('combobox',{name:'Fullscreen visualization'}).selectOption('layered2');await page.getByRole('button',{name:'Fit view',exact:true}).click();await page.screenshot({path:'/tmp/readability-fullscreen-mobile.png',fullPage:false,animations:'disabled'});
 await page.keyboard.press('Escape');await expect(page.getByRole('dialog',{name:'Fullscreen concept explorer'})).toHaveCount(0);await expect(page.getByLabel('YOUR PERSPECTIVE')).toHaveValue('layered2');expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
});
