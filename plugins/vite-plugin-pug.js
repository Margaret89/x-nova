// https://zenn.dev/yend724/articles/20220408-tfq16buha8ctdzp7 Статья на японском xD
// https://zenn.dev/sutobu000/articles/fef3959195cda5 Вторая часть xD


import { vitePluginPugBuild } from "./vite-plugin-pug-build";
import { vitePluginPugServe } from "./vite-plugin-pug-serve";

const vitePluginPug=(settings)=>{
	return [
		vitePluginPugBuild(settings?settings:{}),
		vitePluginPugServe(settings?settings:{}),
	];
};
export default vitePluginPug;