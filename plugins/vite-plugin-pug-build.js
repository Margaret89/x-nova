import fs from "fs";
import { compileFile } from "./pug-api";
import { resolve, parse } from 'path'

export const vitePluginPugBuild = (settings) => {
	const pathMap = {};
	return {
		name: "vite-plugin-pug-build",
		enforce: "pre",
		apply: "build",
		resolveId(source){
			if (source.endsWith(".pug")) {
				const nameExt=parse(source);
				const dummy=resolve(nameExt.dir,(settings.moveToRoot?'../':'./'),nameExt.name+'.html').replace(/\\/g, '/');
				pathMap[dummy] = source;
				return dummy;
			}
		},
		load(id){
			if (id.endsWith(".html")){
				if (pathMap[id]){
					return compileFile(pathMap[id],settings);
				}
				return fs.readFileSync(id,"utf-8");
			}
		},
	};
};