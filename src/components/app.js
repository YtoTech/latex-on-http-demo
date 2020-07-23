import { h, Component } from 'preact';
import doT from 'dot';
import jsYaml from 'js-yaml'
import { saveAs } from 'file-saver';

import CodeMirror from "preact-codemirror";
import 'codemirror/mode/yaml/yaml'
import 'codemirror/mode/stex/stex'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/theme/elegant.css'

import Header from './header';

import style from './style.css';

doT.templateSettings = {
	evaluate:    /\$\$([\s\S]+?)\$\$/g,
	interpolate: /\$\$=([\s\S]+?)\$\$/g,
	encode:      /\$\$!([\s\S]+?)\$\$/g,
	use:         /\$\$#([\s\S]+?)\$\$/g,
	define:      /\$\$##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\$\$/g,
	conditional: /\$\$\?(\?)?\s*([\s\S]*?)\s*\$\$/g,
	iterate:     /\$\$~\s*(?:\$\$|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\$\$)/g,
	varname: 'it',
	strip: false,
	append: true,
	selfcontained: false
};

const DEFAULT_YAML_DATA = `world: 'World'`;
const DEFAULT_LATEX_TEMPLATE = `\\documentclass{article}
\\usepackage{graphicx}
\\begin{document}
Hello $$= it.world $$! \\\\
\\end{document}`;


// TODO create "projects" with localstorage for each project

export default class App extends Component {

	yamlInstance = null;
	latexInstance = null;

	state = {
		jsonData: null,
		latexCompiled: null,
		payload: null
	}

	compile = async () => {
		if(!this.yamlInstance || !this.latexInstance) {
			console.error("Error with code mirrors instances. Try to reload the page.");
			return;
		}

		// TODO manage errors while parsing/templating

		const yaml = this.yamlInstance.getValue()
		const json = jsYaml.safeLoad(yaml);
		this.setState({ jsonData: JSON.stringify(json, null, 2) })
		console.log("yaml to json:", json)
		
		// TODO use https://olado.github.io/doT/index.html instead of underscore.template
		const latex = this.latexInstance.getValue()
		const latexCompiled = doT.template(latex)(json)
		this.setState({ latexCompiled })
		console.log("latex compiled with data:", latexCompiled)
		
		const payload = {
			compiler: "pdflatex", // TODO select for the compiler between availables ones
			resources: [
				{
					main: true,
					content: latexCompiled
				}
			]
		}
		this.setState({ payload: JSON.stringify(payload, null, 2) })
		console.log("payload:", payload)

		// const res = await fetch('https://latex.ytotech.com/builds/sync', {
		// 	method: 'POST',
		// 	headers: {
		// 		Accept: 'application/json',
		// 		'Content-Type': 'application/json'
		// 	},
		// 	responseType: 'blob',
		// 	body: JSON.stringify(payload)
		// })
		// // TODO catch and display errors
		// const blob = await res.blob();

		// // TODO put the name of the current project
		// saveAs(blob, 'default.pdf');
	}

	render() {
		return (
			<div id="app">
				<Header />
				<div class={style.source} >
					<h3>Source data (yaml)</h3>
					<CodeMirror
						code={DEFAULT_YAML_DATA}
						config={{
							lineNumbers: true,
							mode: 'text/x-yaml'
						}}
						instance={instance => {
							this.yamlInstance = instance;
						}}
					/>
				</div>
				
				<div class={style.source} >
					<h3>Source template (LaTeX)</h3>
					<CodeMirror
						code={DEFAULT_LATEX_TEMPLATE}
						config={{
							lineNumbers: true,
							mode: 'text/x-stex'
						}}
						instance={instance => {
							this.latexInstance = instance;
						}}
					/>
				</div>

				{ this.state.jsonData &&
					<div class={style.source} >
						<h3>Generated data (json)</h3>
						<CodeMirror
							code={this.state.jsonData}
							config={{
								lineNumbers: true,
								mode: 'application/json',
								readOnly: true
							}}
						/>
					</div>
				}

				{ this.state.latexCompiled &&
					<div class={style.source} >
						<h3>Generated LaTeX with data</h3>
						<CodeMirror
							code={this.state.latexCompiled}
							config={{
								lineNumbers: true,
								mode: 'text/x-stex',
								readOnly: true
							}}
						/>
					</div>
				}

				{ this.state.payload &&
					<div class={style.sourceFull} >
						<h3>Payload (json) </h3>
						<CodeMirror
							code={this.state.payload}
							config={{
								lineNumbers: true,
								mode: 'application/json',
								readOnly: true
							}}
						/>
					</div>
				}

				<button class={style.compile} onClick={this.compile}>Convert to PDF</button>
			</div>
		);
	}
}
