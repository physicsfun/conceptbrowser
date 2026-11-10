import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
// Serve and bundle MathJax locally, including its dynamically loaded modules/fonts.
const fontsDir=path.resolve('node_modules/@mathjax');
const mathDir=path.resolve('node_modules/mathjax');
export default defineConfig({optimizeDeps:{include:['three','three/addons/controls/OrbitControls.js','three/addons/renderers/CSS2DRenderer.js','d3-force-3d']},plugins:[react(),{name:'local-mathjax',configureServer(server){for(const [route,base] of [['/mathjax-fonts',fontsDir],['/mathjax',mathDir]])server.middlewares.use(route,(req,res,next)=>{const file=path.resolve(base,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(base+path.sep))return next();if(fs.existsSync(file)&&fs.statSync(file).isFile()){res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.woff')?'font/woff':'application/octet-stream');fs.createReadStream(file).pipe(res);}else next();});},closeBundle(){fs.cpSync(mathDir,'dist/mathjax',{recursive:true});fs.cpSync(fontsDir,'dist/mathjax-fonts',{recursive:true});}}]});
