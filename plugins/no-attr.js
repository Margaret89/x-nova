 const noAttr = ({crossorigin,typeModule}) => {
	return {
		name: "no-attribute",
		apply: "build",
		transformIndexHtml(html){
			if(crossorigin){
				html=html.replaceAll(' crossorigin ', " ");
			}
			if(typeModule){
				html=html.replaceAll(' type="module" ', " ");
			}
			return html
		}
	}
}

export default noAttr