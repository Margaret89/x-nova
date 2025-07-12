// vite.config.js
import { resolve as resolve2, parse as parse2, extname } from "path";
import { defineConfig, loadEnv } from "file:///D:/01_Projects/x-nova.local/node_modules/vite/dist/node/index.js";

// plugins/vite-plugin-pug-build.js
import fs from "fs";

// plugins/pug-api.js
import { compileFile as pugCompileFile } from "file:///D:/01_Projects/x-nova.local/node_modules/pug/lib/index.js";
function compileFile(path, { options, locals, moveToRoot }) {
  const compiled = pugCompileFile(path, options)(locals);
  if (moveToRoot) {
    return compiled.replaceAll("../", "./");
  }
  return compiled;
}

// plugins/vite-plugin-pug-build.js
import { resolve, parse } from "path";
var vitePluginPugBuild = (settings) => {
  const pathMap = {};
  return {
    name: "vite-plugin-pug-build",
    enforce: "pre",
    apply: "build",
    resolveId(source) {
      if (source.endsWith(".pug")) {
        const nameExt = parse(source);
        const dummy = resolve(nameExt.dir, settings.moveToRoot ? "../" : "./", nameExt.name + ".html").replace(/\\/g, "/");
        pathMap[dummy] = source;
        return dummy;
      }
    },
    load(id) {
      if (id.endsWith(".html")) {
        if (pathMap[id]) {
          return compileFile(pathMap[id], settings);
        }
        return fs.readFileSync(id, "utf-8");
      }
    }
  };
};

// plugins/vite-plugin-pug-serve.js
import fs2 from "fs";
import { send } from "file:///D:/01_Projects/x-nova.local/node_modules/vite/dist/node/index.js";
var transformPugToHtml = (server, path, compileSettings) => {
  try {
    const compiled = compileFile(path, compileSettings);
    return server.transformIndexHtml(path, compiled);
  } catch (error) {
    console.log(error);
    return server.transformIndexHtml(path, `
			<h1>Pug Error</h1>
			<p>File: ${error.filename}</p>
			<p>Line: ${error.line}:${error.column}</p>
			<p>Message: ${error.msg}</p>
		`);
  }
};
var vitePluginPugServe = ({ moveToRoot, options, locals }) => {
  return {
    name: "vite-plugin-pug-serve",
    enforce: "pre",
    apply: "serve",
    handleHotUpdate(context) {
      context.server.ws.send({
        type: "full-reload"
      });
      return [];
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        let reqPath = req.url;
        if (reqPath.endsWith("/")) {
          reqPath += "index.html";
        }
        if (reqPath.endsWith(".html")) {
          let fullReqPath = server.config.root + (moveToRoot ? "/pages" : "") + reqPath;
          if (fs2.existsSync(fullReqPath)) {
            return next();
          }
          const pugPath = `${fullReqPath.slice(0, Math.max(0, fullReqPath.lastIndexOf("."))) || fullReqPath}.pug`;
          if (!fs2.existsSync(pugPath)) {
            return send(req, res, "404 Not Found", "html", {});
          }
          const html = await transformPugToHtml(server, pugPath, { moveToRoot, options, locals });
          return send(req, res, html, "html", {});
        } else {
          return next();
        }
      });
    }
  };
};

// plugins/vite-plugin-pug.js
var vitePluginPug = (settings) => {
  return [
    vitePluginPugBuild(settings ? settings : {}),
    vitePluginPugServe(settings ? settings : {})
  ];
};
var vite_plugin_pug_default = vitePluginPug;

// src/pages/data.json
var data_default = {
  pages: {
    main: {
      href: "main.html",
      title: "\u0413\u043B\u0430\u0432\u043D\u0430\u044F"
    },
    tipografika: {
      href: "tipografika.html",
      title: "\u0422\u0438\u043F\u043E\u0433\u0440\u0430\u0444\u0438\u043A\u0430",
      h1: "\u0422\u0438\u043F\u043E\u0433\u0440\u0430\u0444\u0438\u043A\u0430"
    }
  }
};

// vite.config.js
import globule from "file:///D:/01_Projects/x-nova.local/node_modules/globule/lib/globule.js";
import ViteSvgSpriteWrapper from "file:///D:/01_Projects/x-nova.local/node_modules/vite-svg-sprite-wrapper/dist/index.js";
import { visualizer } from "file:///D:/01_Projects/x-nova.local/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";

// plugins/no-attr.js
var noAttr = ({ crossorigin, typeModule }) => {
  return {
    name: "no-attribute",
    apply: "build",
    transformIndexHtml(html) {
      if (crossorigin) {
        html = html.replaceAll(" crossorigin ", " ");
      }
      if (typeModule) {
        html = html.replaceAll(' type="module" ', " ");
      }
      return html;
    }
  };
};
var no_attr_default = noAttr;

// vite.config.js
var __vite_injected_original_dirname = "D:\\01_Projects\\x-nova.local";
var vite_config_default = defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  let pugMoveToRoot = ["bitrix", "production"].includes(mode) || env.OUTDIR ? false : true;
  return {
    server: {
      open: pugMoveToRoot ? true : "pages/index.html"
    },
    root: resolve2(__vite_injected_original_dirname, "src"),
    base: mode == "static" ? "/" : "./",
    build: {
      minify: true,
      assetsInlineLimit: 0,
      outDir: resolve2(__vite_injected_original_dirname, env.OUTDIR || "dist"),
      emptyOutDir: mode === "bitrix" || env.OUTDIR ? false : true,
      modulePreload: { polyfill: false },
      rollupOptions: {
        input: globule.find({ src: "*.pug", srcBase: "src/pages", prefixBase: true }).sort(function(a, b) {
          return /index\.pug/i.test(a) ? -1 : 1;
        }).map((item) => resolve2(__vite_injected_original_dirname, item).replace(/\\/g, "/")),
        output: {
          entryFileNames: "js/[name].js",
          chunkFileNames: "js/[name].js",
          manualChunks(file) {
            if (file.includes("node_modules")) {
              return file.split("node_modules/")[1].split("/")[0];
            }
            return "main";
          },
          assetFileNames: ({ name }) => {
            let ext = extname(name);
            if (/sprite/i.test(name)) {
              return `sprites/[name][extname]`;
            }
            if (/icon/i.test(name) && /svg/i.test(ext)) {
              return `icons/[name][extname]`;
            }
            if (/webp|avif|png|jpe?g|svg|gif|ico/i.test(ext)) {
              return `img/[name][extname]`;
            }
            if (/css/i.test(ext)) {
              return `css/[name][extname]`;
            }
            if (/woff2?|eot|ttf/.test(ext)) {
              return `fonts/[name][extname]`;
            }
            return `${ext}/[name][extname]`;
          }
        }
      }
    },
    plugins: [
      vite_plugin_pug_default({
        moveToRoot: pugMoveToRoot,
        options: { pretty: "	" },
        locals: data_default
      }),
      ViteSvgSpriteWrapper({
        icons: "src/icons/*.svg",
        outputDir: "src/sprites",
        sprite: {
          shape: {
            transform: [{
              svgo: {
                plugins: [
                  { name: "preset-default" },
                  "removeNonInheritableGroupAttrs",
                  "removeStyleElement",
                  "collapseGroups",
                  {
                    name: "removeAttrs",
                    params: {
                      attrs: ["*:(data-*|fill|class|style|xml.space):*"]
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
          }
        }
      }),
      visualizer({
        template: "treemap"
        // sunburst, treemap, network, raw-data, list
      }),
      no_attr_default({
        crossorigin: mode == "legacy" ? true : false,
        typeModule: mode == "legacy" ? true : false
      })
    ]
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAicGx1Z2lucy92aXRlLXBsdWdpbi1wdWctYnVpbGQuanMiLCAicGx1Z2lucy9wdWctYXBpLmpzIiwgInBsdWdpbnMvdml0ZS1wbHVnaW4tcHVnLXNlcnZlLmpzIiwgInBsdWdpbnMvdml0ZS1wbHVnaW4tcHVnLmpzIiwgInNyYy9wYWdlcy9kYXRhLmpzb24iLCAicGx1Z2lucy9uby1hdHRyLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcMDFfUHJvamVjdHNcXFxceC1ub3ZhLmxvY2FsXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFwwMV9Qcm9qZWN0c1xcXFx4LW5vdmEubG9jYWxcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6LzAxX1Byb2plY3RzL3gtbm92YS5sb2NhbC92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IHJlc29sdmUsIHBhcnNlLCBleHRuYW1lIH0gZnJvbSAncGF0aCdcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgdml0ZVBsdWdpblB1ZyBmcm9tIFwiLi9wbHVnaW5zL3ZpdGUtcGx1Z2luLXB1Z1wiXG5pbXBvcnQgcHVnRGF0YSBmcm9tICcuL3NyYy9wYWdlcy9kYXRhLmpzb24nXG5pbXBvcnQgZ2xvYnVsZSBmcm9tIFwiZ2xvYnVsZVwiXG5pbXBvcnQgVml0ZVN2Z1Nwcml0ZVdyYXBwZXIgZnJvbSAndml0ZS1zdmctc3ByaXRlLXdyYXBwZXInO1xuaW1wb3J0IHsgdmlzdWFsaXplciB9IGZyb20gXCJyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXJcIjtcbmltcG9ydCBub0F0dHIgZnJvbSAnLi9wbHVnaW5zL25vLWF0dHInXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBjb21tYW5kLCBtb2RlIH0pPT57XG5cdGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpXG5cdGxldCBwdWdNb3ZlVG9Sb290PShbJ2JpdHJpeCcsJ3Byb2R1Y3Rpb24nXS5pbmNsdWRlcyhtb2RlKSB8fCBlbnYuT1VURElSKT9mYWxzZTp0cnVlXG5cdHJldHVybiB7XG5cdFx0c2VydmVyOntcblx0XHRcdG9wZW46KHB1Z01vdmVUb1Jvb3QpP3RydWU6J3BhZ2VzL2luZGV4Lmh0bWwnLFxuXHRcdH0sXG5cdFx0cm9vdDogcmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjXCIpLFxuXHRcdGJhc2U6IChtb2RlPT0nc3RhdGljJyk/Jy8nOicuLycsXG5cdFx0YnVpbGQ6IHtcblx0XHRcdG1pbmlmeTogdHJ1ZSxcblx0XHRcdGFzc2V0c0lubGluZUxpbWl0OiAwLFxuXHRcdFx0b3V0RGlyOnJlc29sdmUoX19kaXJuYW1lLCBlbnYuT1VURElSIHx8ICdkaXN0JyksXG5cdFx0XHRlbXB0eU91dERpcjoobW9kZT09PSdiaXRyaXgnfHxlbnYuT1VURElSKT9mYWxzZTp0cnVlLFxuXHRcdFx0bW9kdWxlUHJlbG9hZDp7cG9seWZpbGw6IGZhbHNlLH0sXG5cdFx0XHRyb2xsdXBPcHRpb25zOntcblx0XHRcdFx0aW5wdXQ6XG5cdFx0XHRcdFx0Z2xvYnVsZVxuXHRcdFx0XHRcdFx0LmZpbmQoe3NyYzonKi5wdWcnLCBzcmNCYXNlOiBcInNyYy9wYWdlc1wiLCBwcmVmaXhCYXNlOiB0cnVlfSlcblx0XHRcdFx0XHRcdC5zb3J0KGZ1bmN0aW9uKGEsYil7cmV0dXJuICggL2luZGV4XFwucHVnL2kudGVzdChhKSApPy0xOjF9KSAvLyBcdTA0MzRcdTA0M0JcdTA0NEYgXHUwNDQyXHUwNDNFXHUwNDMzXHUwNDNFIFx1MDQ0N1x1MDQ0Mlx1MDQzRVx1MDQzMVx1MDQ0QiBhc3NldHMgXHUwNDNEXHUwNDMwXHUwNDM3XHUwNDRCXHUwNDMyXHUwNDMwXHUwNDNCXHUwNDM4XHUwNDQxXHUwNDRDIFx1MDQzQVx1MDQzMFx1MDQzQSBcdTA0M0RcdTA0MzBcdTA0MzRcdTA0M0Vcblx0XHRcdFx0XHRcdC5tYXAoaXRlbT0+cmVzb2x2ZShfX2Rpcm5hbWUsIGl0ZW0pLnJlcGxhY2UoL1xcXFwvZywgJy8nKSksXG5cdFx0XHRcdG91dHB1dDp7XG5cdFx0XHRcdFx0ZW50cnlGaWxlTmFtZXM6IFwianMvW25hbWVdLmpzXCIsXG5cdFx0XHRcdFx0Y2h1bmtGaWxlTmFtZXM6IFwianMvW25hbWVdLmpzXCIsXG5cdFx0XHRcdFx0bWFudWFsQ2h1bmtzKGZpbGUpe1xuXHRcdFx0XHRcdFx0aWYgKGZpbGUuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKXtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGZpbGUuc3BsaXQoJ25vZGVfbW9kdWxlcy8nKVsxXS5zcGxpdCgnLycpWzBdIC8vIFx1MDQ0MVx1MDQzMVx1MDQzRVx1MDQ0MFx1MDQzQVx1MDQzMCBcdTA0M0ZcdTA0M0UgXHUwNDM3XHUwNDMwXHUwNDMyXHUwNDM4XHUwNDQxXHUwNDM4XHUwNDNDXHUwNDNFXHUwNDQxXHUwNDQyXHUwNDRGXHUwNDNDXG5cdFx0XHRcdFx0XHRcdC8vIHJldHVybiBwYXJzZShmaWxlKS5uYW1lOyAvLyBcdTA0MzJcdTA0NDFcdTA0MzUgXHUwNDQ0XHUwNDMwXHUwNDM5XHUwNDNCXHUwNDRCIFx1MDQzMVx1MDQ0M1x1MDQzNFx1MDQ0M1x1MDQ0MiBcdTA0M0VcdTA0NDJcdTA0MzRcdTA0MzVcdTA0M0JcdTA0NENcdTA0M0RcdTA0NEJcdTA0M0NcdTA0Mzhcblx0XHRcdFx0XHRcdFx0Ly8gcmV0dXJuICd2ZW5kb3InIC8vIFx1MDQzRVx1MDQzNFx1MDQzOFx1MDQzRCBcdTA0M0VcdTA0MzFcdTA0NDlcdTA0MzhcdTA0MzkgdmVuZG9yXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXR1cm4gJ21haW4nO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0YXNzZXRGaWxlTmFtZXM6ICh7bmFtZX0pID0+IHtcblx0XHRcdFx0XHRcdGxldCBleHQgPSBleHRuYW1lKG5hbWUpXG5cdFx0XHRcdFx0XHRpZigvc3ByaXRlL2kudGVzdChuYW1lKSl7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBgc3ByaXRlcy9bbmFtZV1bZXh0bmFtZV1gO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZigvaWNvbi9pLnRlc3QobmFtZSkgJiYgL3N2Zy9pLnRlc3QoZXh0KSl7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBgaWNvbnMvW25hbWVdW2V4dG5hbWVdYDtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKC93ZWJwfGF2aWZ8cG5nfGpwZT9nfHN2Z3xnaWZ8aWNvL2kudGVzdChleHQpKXtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGBpbWcvW25hbWVdW2V4dG5hbWVdYDsgLy8gXHUwNDNDXHUwNDNFXHUwNDM2XHUwNDNEXHUwNDNFIFx1MDQzNFx1MDQzRVx1MDQzMVx1MDQzMFx1MDQzMlx1MDQzOFx1MDQ0Mlx1MDQ0QyBbaGFzaF1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKC9jc3MvaS50ZXN0KGV4dCkpe1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gYGNzcy9bbmFtZV1bZXh0bmFtZV1gO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAoL3dvZmYyP3xlb3R8dHRmLy50ZXN0KGV4dCkpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGBmb250cy9bbmFtZV1bZXh0bmFtZV1gO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cmV0dXJuIGAke2V4dH0vW25hbWVdW2V4dG5hbWVdYDtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHR9LFxuXHRcdHBsdWdpbnM6IFtcblx0XHRcdHZpdGVQbHVnaW5QdWcoe1xuXHRcdFx0XHRtb3ZlVG9Sb290OnB1Z01vdmVUb1Jvb3QsXG5cdFx0XHRcdG9wdGlvbnM6e3ByZXR0eTonXFx0J30sXG5cdFx0XHRcdGxvY2FsczpwdWdEYXRhLFxuXHRcdFx0fSksXG5cdFx0XHRWaXRlU3ZnU3ByaXRlV3JhcHBlcih7XG5cdFx0XHRcdGljb25zOidzcmMvaWNvbnMvKi5zdmcnLFxuXHRcdFx0XHRvdXRwdXREaXI6J3NyYy9zcHJpdGVzJyxcblx0XHRcdFx0c3ByaXRlOntcblx0XHRcdFx0XHRzaGFwZToge1xuXHRcdFx0XHRcdFx0dHJhbnNmb3JtOiBbe1xuXHRcdFx0XHRcdFx0XHRzdmdvOiB7XG5cdFx0XHRcdFx0XHRcdFx0cGx1Z2luczogW1xuXHRcdFx0XHRcdFx0XHRcdFx0e25hbWU6XCJwcmVzZXQtZGVmYXVsdFwifSxcblx0XHRcdFx0XHRcdFx0XHRcdFwicmVtb3ZlTm9uSW5oZXJpdGFibGVHcm91cEF0dHJzXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcInJlbW92ZVN0eWxlRWxlbWVudFwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0XCJjb2xsYXBzZUdyb3Vwc1wiLFxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRuYW1lOiBcInJlbW92ZUF0dHJzXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHBhcmFtczoge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGF0dHJzOiBbJyo6KGRhdGEtKnxmaWxsfGNsYXNzfHN0eWxlfHhtbC5zcGFjZSk6KiddXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG5hbWU6IFwiYWRkQXR0cmlidXRlc1RvU1ZHRWxlbWVudFwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRwYXJhbXM6IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhdHRyaWJ1dGVzOiBbXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR7IGZpbGw6IFwiY3VycmVudENvbG9yXCIgfVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdF1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRcdFwicmVtb3ZlWE1MTlNcIlxuXHRcdFx0XHRcdFx0XHRcdF1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fV1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9XG5cdFx0XHR9KSxcblx0XHRcdHZpc3VhbGl6ZXIoe1xuXHRcdFx0XHR0ZW1wbGF0ZTondHJlZW1hcCcgLy8gc3VuYnVyc3QsIHRyZWVtYXAsIG5ldHdvcmssIHJhdy1kYXRhLCBsaXN0XG5cdFx0XHR9KSxcblx0XHRcdG5vQXR0cih7XG5cdFx0XHRcdGNyb3Nzb3JpZ2luOihtb2RlPT0nbGVnYWN5Jyk/dHJ1ZTpmYWxzZSxcblx0XHRcdFx0dHlwZU1vZHVsZToobW9kZT09J2xlZ2FjeScpP3RydWU6ZmFsc2UsXG5cdFx0XHR9KSxcblx0XHRdLFxuXHR9XG59KSIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcMDFfUHJvamVjdHNcXFxceC1ub3ZhLmxvY2FsXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXDAxX1Byb2plY3RzXFxcXHgtbm92YS5sb2NhbFxcXFxwbHVnaW5zXFxcXHZpdGUtcGx1Z2luLXB1Zy1idWlsZC5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovMDFfUHJvamVjdHMveC1ub3ZhLmxvY2FsL3BsdWdpbnMvdml0ZS1wbHVnaW4tcHVnLWJ1aWxkLmpzXCI7aW1wb3J0IGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IHsgY29tcGlsZUZpbGUgfSBmcm9tIFwiLi9wdWctYXBpXCI7XG5pbXBvcnQgeyByZXNvbHZlLCBwYXJzZSB9IGZyb20gJ3BhdGgnXG5cbmV4cG9ydCBjb25zdCB2aXRlUGx1Z2luUHVnQnVpbGQgPSAoc2V0dGluZ3MpID0+IHtcblx0Y29uc3QgcGF0aE1hcCA9IHt9O1xuXHRyZXR1cm4ge1xuXHRcdG5hbWU6IFwidml0ZS1wbHVnaW4tcHVnLWJ1aWxkXCIsXG5cdFx0ZW5mb3JjZTogXCJwcmVcIixcblx0XHRhcHBseTogXCJidWlsZFwiLFxuXHRcdHJlc29sdmVJZChzb3VyY2Upe1xuXHRcdFx0aWYgKHNvdXJjZS5lbmRzV2l0aChcIi5wdWdcIikpIHtcblx0XHRcdFx0Y29uc3QgbmFtZUV4dD1wYXJzZShzb3VyY2UpO1xuXHRcdFx0XHRjb25zdCBkdW1teT1yZXNvbHZlKG5hbWVFeHQuZGlyLChzZXR0aW5ncy5tb3ZlVG9Sb290PycuLi8nOicuLycpLG5hbWVFeHQubmFtZSsnLmh0bWwnKS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG5cdFx0XHRcdHBhdGhNYXBbZHVtbXldID0gc291cmNlO1xuXHRcdFx0XHRyZXR1cm4gZHVtbXk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRsb2FkKGlkKXtcblx0XHRcdGlmIChpZC5lbmRzV2l0aChcIi5odG1sXCIpKXtcblx0XHRcdFx0aWYgKHBhdGhNYXBbaWRdKXtcblx0XHRcdFx0XHRyZXR1cm4gY29tcGlsZUZpbGUocGF0aE1hcFtpZF0sc2V0dGluZ3MpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBmcy5yZWFkRmlsZVN5bmMoaWQsXCJ1dGYtOFwiKTtcblx0XHRcdH1cblx0XHR9LFxuXHR9O1xufTsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXDAxX1Byb2plY3RzXFxcXHgtbm92YS5sb2NhbFxcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFwwMV9Qcm9qZWN0c1xcXFx4LW5vdmEubG9jYWxcXFxccGx1Z2luc1xcXFxwdWctYXBpLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi8wMV9Qcm9qZWN0cy94LW5vdmEubG9jYWwvcGx1Z2lucy9wdWctYXBpLmpzXCI7aW1wb3J0IHsgY29tcGlsZUZpbGUgYXMgcHVnQ29tcGlsZUZpbGUgfSBmcm9tIFwicHVnXCI7XG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZUZpbGUocGF0aCx7IG9wdGlvbnMsbG9jYWxzLG1vdmVUb1Jvb3QgfSl7XG5cdGNvbnN0IGNvbXBpbGVkID0gcHVnQ29tcGlsZUZpbGUocGF0aCxvcHRpb25zKShsb2NhbHMpO1xuXHRpZihtb3ZlVG9Sb290KXtcblx0XHRyZXR1cm4gY29tcGlsZWQucmVwbGFjZUFsbCgnLi4vJywnLi8nKVxuXHR9XG5cdHJldHVybiBjb21waWxlZDtcbn07XG5cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcMDFfUHJvamVjdHNcXFxceC1ub3ZhLmxvY2FsXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXDAxX1Byb2plY3RzXFxcXHgtbm92YS5sb2NhbFxcXFxwbHVnaW5zXFxcXHZpdGUtcGx1Z2luLXB1Zy1zZXJ2ZS5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovMDFfUHJvamVjdHMveC1ub3ZhLmxvY2FsL3BsdWdpbnMvdml0ZS1wbHVnaW4tcHVnLXNlcnZlLmpzXCI7aW1wb3J0IGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IHsgc2VuZCB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgeyBjb21waWxlRmlsZSB9IGZyb20gJy4vcHVnLWFwaSc7XG5cblxuY29uc3QgdHJhbnNmb3JtUHVnVG9IdG1sID0gKHNlcnZlciwgcGF0aCwgY29tcGlsZVNldHRpbmdzKSA9PiB7XG5cdHRyeSB7XG5cdFx0Y29uc3QgY29tcGlsZWQ9Y29tcGlsZUZpbGUocGF0aCxjb21waWxlU2V0dGluZ3MpO1xuXHRcdHJldHVybiBzZXJ2ZXIudHJhbnNmb3JtSW5kZXhIdG1sKHBhdGgsIGNvbXBpbGVkKTtcblx0fWNhdGNoIChlcnJvcil7XG5cdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdHJldHVybiBzZXJ2ZXIudHJhbnNmb3JtSW5kZXhIdG1sKHBhdGgsIGBcblx0XHRcdDxoMT5QdWcgRXJyb3I8L2gxPlxuXHRcdFx0PHA+RmlsZTogJHtlcnJvci5maWxlbmFtZX08L3A+XG5cdFx0XHQ8cD5MaW5lOiAke2Vycm9yLmxpbmV9OiR7ZXJyb3IuY29sdW1ufTwvcD5cblx0XHRcdDxwPk1lc3NhZ2U6ICR7ZXJyb3IubXNnfTwvcD5cblx0XHRgKTtcblx0fVxufTtcblxuZXhwb3J0IGNvbnN0IHZpdGVQbHVnaW5QdWdTZXJ2ZSA9ICh7IG1vdmVUb1Jvb3QsIG9wdGlvbnMsIGxvY2FscyB9KSA9PiB7XG5cdHJldHVybiB7XG5cdFx0bmFtZTogXCJ2aXRlLXBsdWdpbi1wdWctc2VydmVcIixcblx0XHRlbmZvcmNlOiBcInByZVwiLFxuXHRcdGFwcGx5OiBcInNlcnZlXCIsXG5cdFx0aGFuZGxlSG90VXBkYXRlKGNvbnRleHQpIHtcblx0XHRcdGNvbnRleHQuc2VydmVyLndzLnNlbmQoe1xuXHRcdFx0XHR0eXBlOiBcImZ1bGwtcmVsb2FkXCIsXG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBbXTtcblx0XHR9LFxuXHRcdGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcblx0XHRcdHNlcnZlci5taWRkbGV3YXJlcy51c2UoYXN5bmMgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG5cdFx0XHRcdGxldCByZXFQYXRoPXJlcS51cmw7XG5cdFx0XHRcdGlmKHJlcVBhdGguZW5kc1dpdGgoXCIvXCIpKXtcblx0XHRcdFx0XHRyZXFQYXRoICs9IFwiaW5kZXguaHRtbFwiXG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHJlcVBhdGguZW5kc1dpdGgoXCIuaHRtbFwiKSkge1xuXHRcdFx0XHRcdGxldCBmdWxsUmVxUGF0aCA9IHNlcnZlci5jb25maWcucm9vdCArIChtb3ZlVG9Sb290PycvcGFnZXMnOicnKSArIHJlcVBhdGg7XG5cblx0XHRcdFx0XHRpZiAoZnMuZXhpc3RzU3luYyhmdWxsUmVxUGF0aCkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBuZXh0KCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc3QgcHVnUGF0aCA9IGAke2Z1bGxSZXFQYXRoLnNsaWNlKDAsIE1hdGgubWF4KDAsIGZ1bGxSZXFQYXRoLmxhc3RJbmRleE9mKFwiLlwiKSkpIHx8IGZ1bGxSZXFQYXRofS5wdWdgO1xuXHRcdFx0XHRcdGlmKCFmcy5leGlzdHNTeW5jKHB1Z1BhdGgpKXtcblx0XHRcdFx0XHRcdHJldHVybiBzZW5kKHJlcSwgcmVzLCBcIjQwNCBOb3QgRm91bmRcIiwgXCJodG1sXCIsIHt9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29uc3QgaHRtbCA9IGF3YWl0IHRyYW5zZm9ybVB1Z1RvSHRtbChzZXJ2ZXIsIHB1Z1BhdGgsIHsgbW92ZVRvUm9vdCwgb3B0aW9ucywgbG9jYWxzIH0pO1xuXHRcdFx0XHRcdHJldHVybiBzZW5kKHJlcSwgcmVzLCBodG1sLCBcImh0bWxcIiwge30pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBuZXh0KCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0sXG5cdH07XG59OyIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcMDFfUHJvamVjdHNcXFxceC1ub3ZhLmxvY2FsXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXDAxX1Byb2plY3RzXFxcXHgtbm92YS5sb2NhbFxcXFxwbHVnaW5zXFxcXHZpdGUtcGx1Z2luLXB1Zy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovMDFfUHJvamVjdHMveC1ub3ZhLmxvY2FsL3BsdWdpbnMvdml0ZS1wbHVnaW4tcHVnLmpzXCI7Ly8gaHR0cHM6Ly96ZW5uLmRldi95ZW5kNzI0L2FydGljbGVzLzIwMjIwNDA4LXRmcTE2YnVoYThjdGR6cDcgXHUwNDIxXHUwNDQyXHUwNDMwXHUwNDQyXHUwNDRDXHUwNDRGIFx1MDQzRFx1MDQzMCBcdTA0NEZcdTA0M0ZcdTA0M0VcdTA0M0RcdTA0NDFcdTA0M0FcdTA0M0VcdTA0M0MgeERcbi8vIGh0dHBzOi8vemVubi5kZXYvc3V0b2J1MDAwL2FydGljbGVzL2ZlZjM5NTkxOTVjZGE1IFx1MDQxMlx1MDQ0Mlx1MDQzRVx1MDQ0MFx1MDQzMFx1MDQ0RiBcdTA0NDdcdTA0MzBcdTA0NDFcdTA0NDJcdTA0NEMgeERcblxuXG5pbXBvcnQgeyB2aXRlUGx1Z2luUHVnQnVpbGQgfSBmcm9tIFwiLi92aXRlLXBsdWdpbi1wdWctYnVpbGRcIjtcbmltcG9ydCB7IHZpdGVQbHVnaW5QdWdTZXJ2ZSB9IGZyb20gXCIuL3ZpdGUtcGx1Z2luLXB1Zy1zZXJ2ZVwiO1xuXG5jb25zdCB2aXRlUGx1Z2luUHVnPShzZXR0aW5ncyk9Pntcblx0cmV0dXJuIFtcblx0XHR2aXRlUGx1Z2luUHVnQnVpbGQoc2V0dGluZ3M/c2V0dGluZ3M6e30pLFxuXHRcdHZpdGVQbHVnaW5QdWdTZXJ2ZShzZXR0aW5ncz9zZXR0aW5nczp7fSksXG5cdF07XG59O1xuZXhwb3J0IGRlZmF1bHQgdml0ZVBsdWdpblB1ZzsiLCAie1xuXHRcInBhZ2VzXCI6e1xuXHRcdFwibWFpblwiOntcblx0XHRcdFwiaHJlZlwiOiBcIm1haW4uaHRtbFwiLFxuXHRcdFx0XCJ0aXRsZVwiOlwiXHUwNDEzXHUwNDNCXHUwNDMwXHUwNDMyXHUwNDNEXHUwNDMwXHUwNDRGXCJcblx0XHR9LFxuXHRcdFwidGlwb2dyYWZpa2FcIjp7XG5cdFx0XHRcImhyZWZcIjogXCJ0aXBvZ3JhZmlrYS5odG1sXCIsXG5cdFx0XHRcInRpdGxlXCI6XCJcdTA0MjJcdTA0MzhcdTA0M0ZcdTA0M0VcdTA0MzNcdTA0NDBcdTA0MzBcdTA0NDRcdTA0MzhcdTA0M0FcdTA0MzBcIixcblx0XHRcdFwiaDFcIjpcIlx1MDQyMlx1MDQzOFx1MDQzRlx1MDQzRVx1MDQzM1x1MDQ0MFx1MDQzMFx1MDQ0NFx1MDQzOFx1MDQzQVx1MDQzMFwiXG5cdFx0fVxuXHR9XG59IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFwwMV9Qcm9qZWN0c1xcXFx4LW5vdmEubG9jYWxcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcMDFfUHJvamVjdHNcXFxceC1ub3ZhLmxvY2FsXFxcXHBsdWdpbnNcXFxcbm8tYXR0ci5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovMDFfUHJvamVjdHMveC1ub3ZhLmxvY2FsL3BsdWdpbnMvbm8tYXR0ci5qc1wiOyBjb25zdCBub0F0dHIgPSAoe2Nyb3Nzb3JpZ2luLHR5cGVNb2R1bGV9KSA9PiB7XG5cdHJldHVybiB7XG5cdFx0bmFtZTogXCJuby1hdHRyaWJ1dGVcIixcblx0XHRhcHBseTogXCJidWlsZFwiLFxuXHRcdHRyYW5zZm9ybUluZGV4SHRtbChodG1sKXtcblx0XHRcdGlmKGNyb3Nzb3JpZ2luKXtcblx0XHRcdFx0aHRtbD1odG1sLnJlcGxhY2VBbGwoJyBjcm9zc29yaWdpbiAnLCBcIiBcIik7XG5cdFx0XHR9XG5cdFx0XHRpZih0eXBlTW9kdWxlKXtcblx0XHRcdFx0aHRtbD1odG1sLnJlcGxhY2VBbGwoJyB0eXBlPVwibW9kdWxlXCIgJywgXCIgXCIpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGh0bWxcblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbm9BdHRyIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5USxTQUFTLFdBQUFBLFVBQVMsU0FBQUMsUUFBTyxlQUFlO0FBQ2pULFNBQVMsY0FBYyxlQUFlOzs7QUNEaVIsT0FBTyxRQUFROzs7QUNBM0MsU0FB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
