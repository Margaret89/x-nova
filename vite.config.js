import { resolve, parse, extname } from 'path'
import { defineConfig, loadEnv } from 'vite'
import vitePluginPug from "./plugins/vite-plugin-pug"
import pugData from './src/pages/data.json'
import globule from "globule"
import ViteSvgSpriteWrapper from 'vite-svg-sprite-wrapper';
import { visualizer } from "rollup-plugin-visualizer";
import noAttr from './plugins/no-attr'

export default defineConfig(({ command, mode })=>{
	const env = loadEnv(mode, process.cwd(), '')
	let pugMoveToRoot=(['bitrix','production'].includes(mode) || env.OUTDIR)?false:true
	return {
		server:{
			open:(pugMoveToRoot)?true:'pages/index.html',
		},
		root: resolve(__dirname, "src"),
		base: (mode=='static')?'/':'./',
		build: {
			minify: true,
			assetsInlineLimit: 0,
			outDir:resolve(__dirname, env.OUTDIR || 'dist'),
			emptyOutDir:(mode==='bitrix'||env.OUTDIR)?false:true,
			modulePreload:{polyfill: false,},
			rollupOptions:{
				input:
					globule
						.find({src:'*.pug', srcBase: "src/pages", prefixBase: true})
						.sort(function(a,b){return ( /index\.pug/i.test(a) )?-1:1}) // для того чтобы assets назывались как надо
						.map(item=>resolve(__dirname, item).replace(/\\/g, '/')),
				output:{
					entryFileNames: "js/[name].js",
					chunkFileNames: "js/[name].js",
					manualChunks(file){
						if (file.includes('node_modules')){
							return file.split('node_modules/')[1].split('/')[0] // сборка по зависимостям
							// return parse(file).name; // все файлы будут отдельными
							// return 'vendor' // один общий vendor
						}
						return 'main';
					},
					assetFileNames: ({name}) => {
						let ext = extname(name)
						if(/sprite/i.test(name)){
							return `sprites/[name][extname]`;
						}

						if(/icon/i.test(name) && /svg/i.test(ext)){
							return `icons/[name][extname]`;
						}

						if (/webp|avif|png|jpe?g|svg|gif|ico/i.test(ext)){
							return `img/[name][extname]`; // можно добавить [hash]
						}

						if (/css/i.test(ext)){
							return `css/[name][extname]`;
						}

						if (/woff2?|eot|ttf/.test(ext)) {
							return `fonts/[name][extname]`;
						}
						return `${ext}/[name][extname]`;
					},
				},
			},
		},
		plugins: [
			vitePluginPug({
				moveToRoot:pugMoveToRoot,
				options:{pretty:'\t'},
				locals:pugData,
			}),
			ViteSvgSpriteWrapper({
				icons:'src/icons/*.svg',
				outputDir:'src/sprites',
				sprite:{
					shape: {
						transform: [{
							svgo: {
								plugins: [
									{name:"preset-default"},
									"removeNonInheritableGroupAttrs",
									"removeStyleElement",
									"collapseGroups",
									{
										name: "removeAttrs",
										params: {
											attrs: ['*:(data-*|fill|class|style|xml.space):*']
										}
									},
									{
										name: "addAttributesToSVGElement",
										params: {
											attributes: [
												{ fill: "currentColor" }
											]
										}
									},
									"removeXMLNS"
								]
							}
						}]
					},
				}
			}),
			visualizer({
				template:'treemap' // sunburst, treemap, network, raw-data, list
			}),
			noAttr({
				crossorigin:(mode=='legacy')?true:false,
				typeModule:(mode=='legacy')?true:false,
			}),
		],
	}
})