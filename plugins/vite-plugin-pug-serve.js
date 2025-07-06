import fs from "fs";
import { send } from "vite";
import { compileFile } from './pug-api';


const transformPugToHtml = (server, path, compileSettings) => {
	try {
		const compiled=compileFile(path,compileSettings);
		return server.transformIndexHtml(path, compiled);
	}catch (error){
		console.log(error);
		return server.transformIndexHtml(path, `
			<h1>Pug Error</h1>
			<p>File: ${error.filename}</p>
			<p>Line: ${error.line}:${error.column}</p>
			<p>Message: ${error.msg}</p>
		`);
	}
};

export const vitePluginPugServe = ({ moveToRoot, options, locals }) => {
	return {
		name: "vite-plugin-pug-serve",
		enforce: "pre",
		apply: "serve",
		handleHotUpdate(context) {
			context.server.ws.send({
				type: "full-reload",
			});
			return [];
		},
		configureServer(server) {
			server.middlewares.use(async (req, res, next) => {
				let reqPath=req.url;
				if(reqPath.endsWith("/")){
					reqPath += "index.html"
				}
				if (reqPath.endsWith(".html")) {
					let fullReqPath = server.config.root + (moveToRoot?'/pages':'') + reqPath;

					if (fs.existsSync(fullReqPath)) {
						return next();
					}

					const pugPath = `${fullReqPath.slice(0, Math.max(0, fullReqPath.lastIndexOf("."))) || fullReqPath}.pug`;
					if(!fs.existsSync(pugPath)){
						return send(req, res, "404 Not Found", "html", {});
					}
					const html = await transformPugToHtml(server, pugPath, { moveToRoot, options, locals });
					return send(req, res, html, "html", {});
				} else {
					return next();
				}
			});
		},
	};
};