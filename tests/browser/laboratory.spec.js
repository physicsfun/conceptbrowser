import {test,expect} from '@playwright/test';
const names=['2D Force-Directed Network','2D Radial Concept Map','2D Hierarchical / Layered Graph','2D Clustered Network','3D Force-Directed Network','3D Radial / Orbital Network','3D Clustered Network'];
const select=page=>page.getByLabel('YOUR PERSPECTIVE');
async function start(page){await page.goto('/');await page.getByRole('button',{name:'Explore',exact:true}).click();}
test('all seven render, preserve context, and support overview and focus',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await start(page);
 await page.getByRole('searchbox',{name:'Search this network'}).fill('potential energy');await page.locator('.lab-results').getByRole('button',{name:'Electric Potential Energy'}).click();
 await page.getByRole('button',{name:'Focused mode',exact:true}).click();
 const initial=await page.locator('.graph-toolbar').textContent();
 for(const name of names){await select(page).selectOption({label:name});await expect(page.getByRole('complementary',{name:'Selected concept'}).getByRole('heading',{name:'Electric Potential Energy',exact:true})).toBeVisible();await expect(page.locator('.graph-toolbar')).toHaveText(initial);
  if(name.startsWith('3D')){await expect(page.locator('.spatial-canvas canvas')).toBeVisible();await expect(page.locator('.spatial-badge')).toContainText('READY');await expect(page.locator('.webgl-error')).toHaveCount(0);await expect(page.locator('.spatial-label.selected')).toHaveText('Electric Potential Energy');await page.screenshot({path:`/tmp/lab-${name.includes('Orbital')?'orbital':name.includes('Clustered')?'cluster3':'force3'}.png`,fullPage:true});}
  else{await expect(page.locator('.graph-node')).toHaveCount(Number(initial.match(/\d+/)[0]));await expect(page.locator('.graph-stage')).toBeVisible();await page.screenshot({path:`/tmp/lab-${name.includes('Force')?'force2':name.includes('Radial')?'radial2':name.includes('Layered')?'layered2':'cluster2'}.png`,fullPage:true});}
  await page.getByRole('button',{name:'Overview mode',exact:true}).click();await expect(page.locator('.graph-toolbar')).toContainText('44 of 44');
  await page.getByRole('button',{name:'Focused mode',exact:true}).click();await expect(page.locator('.graph-toolbar')).not.toContainText('44 of 44');
 }
 expect(errors).toEqual([]);
});
test('2D drag, layer curves, cluster focus, notes and shared resources',async({page})=>{
 await start(page);const node=page.locator('.graph-node[aria-pressed=true]');await node.scrollIntoViewIfNeeded();const before=await node.getAttribute('style');const box=await node.boundingBox();await page.mouse.move(box.x+50,box.y+30);await page.mouse.down();await page.mouse.move(box.x+100,box.y+60,{steps:5});await page.mouse.up();await expect(node).not.toHaveAttribute('style',before);
 await select(page).selectOption('layered2');await expect(page.locator('.graph-edge path').first()).toHaveAttribute('d',/ C/);
 await page.getByRole('checkbox',{name:'Conceptual connections',exact:true}).uncheck();await expect(page.locator('.graph-edge.conceptual')).toHaveCount(0);await page.getByRole('checkbox',{name:'Conceptual connections',exact:true}).check();
 await select(page).selectOption('cluster2');await expect(page.locator('.cluster-region')).not.toHaveCount(0);await page.getByLabel('Focus a subject group').selectOption('fields-forces');
 await page.getByText('Your observations · stored on this device').click();await page.getByRole('textbox',{name:'Observations for 2D Clustered Network'}).fill('Cross-links are easier to spot.');await select(page).selectOption('radial2');await select(page).selectOption('cluster2');await expect(page.getByRole('textbox',{name:'Observations for 2D Clustered Network'})).toHaveValue('Cross-links are easier to spot.');
 await page.locator('.graph-resources').getByRole('button',{name:/Written explanation The electric field/}).click();await expect(page.locator('dialog mjx-container').first()).toBeVisible();await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Open topic page'}).click();await page.getByRole('button',{name:'Explore',exact:true}).click();await expect(select(page)).toHaveValue('cluster2');await page.screenshot({path:'/tmp/lab-cluster2.png',fullPage:true});
});
test('WebGL failure offers 2D without losing exploration',async({page})=>{
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type.startsWith('webgl'))return null;return original.call(this,type,...args)}});
 await start(page);await select(page).selectOption('radial3');await expect(page.getByRole('alert')).toContainText('WebGL could not start');await page.getByRole('button',{name:'Switch to 2D Force-Directed'}).click();await expect(select(page)).toHaveValue('force2');await expect(page.locator('.graph-node[aria-pressed=true] strong')).toHaveText('Electric Field');await page.getByRole('button',{name:'Browse',exact:true}).click();await expect(page.getByRole('heading',{name:'Small ideas. A bigger picture.'})).toBeVisible();
});
test('mobile 3D and 2D remain usable with keyboard and panel links',async({page})=>{
 await page.setViewportSize({width:390,height:844});await start(page);await select(page).selectOption('radial3');await expect(page.locator('.spatial-badge')).toContainText('READY');
 await page.locator('.spatial-stage').scrollIntoViewIfNeeded();await page.locator('.spatial-stage').focus();await page.keyboard.press('ArrowRight');await page.keyboard.press('+');
 await page.getByRole('complementary',{name:'Selected concept'}).getByRole('button',{name:/^Electric Charge Electric charge/}).click();await expect(page.locator('.spatial-label.selected')).toHaveText('Electric Charge');await page.getByRole('button',{name:'Center selected concept'}).click();
 await page.screenshot({path:'/tmp/lab-mobile3.png',fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await select(page).selectOption('radial2');await expect(page.locator('.graph-node[aria-pressed=true] strong')).toHaveText('Electric Charge');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('3D loads on demand and stops rendering after interaction settles',async({page})=>{
 const requested=[];page.on('request',request=>requested.push(request.url()));
 await page.addInitScript(()=>{window.__gpuDraws=0;const original=WebGL2RenderingContext.prototype.drawElements;WebGL2RenderingContext.prototype.drawElements=function(...args){window.__gpuDraws++;return original.apply(this,args)}});
 await start(page);expect(requested.some(url=>url.includes('/Graph3D')||url.includes('/three.js'))).toBe(false);
 await select(page).selectOption('force3');await expect(page.locator('.spatial-badge')).toContainText('READY');await expect.poll(()=>page.evaluate(()=>window.__gpuDraws)).toBeGreaterThan(0);
 await page.waitForTimeout(450);const draws=await page.evaluate(()=>window.__gpuDraws);await page.waitForTimeout(450);expect(await page.evaluate(()=>window.__gpuDraws)).toBe(draws);
 const stage=page.locator('.spatial-stage');await stage.scrollIntoViewIfNeeded();await stage.focus();await page.keyboard.press('ArrowRight');await expect.poll(()=>page.evaluate(()=>window.__gpuDraws)).toBeGreaterThan(draws);
});
