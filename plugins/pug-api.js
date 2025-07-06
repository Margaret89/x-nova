import { compileFile as pugCompileFile } from "pug";
export function compileFile(path,{ options,locals,moveToRoot }){
	const compiled = pugCompileFile(path,options)(locals);
	if(moveToRoot){
		return compiled.replaceAll('../','./')
	}
	return compiled;
};

