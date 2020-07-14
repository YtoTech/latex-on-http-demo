import { h, Component } from 'preact';
import _ from 'underscore';
import jsYaml from 'js-yaml'
import { saveAs } from 'file-saver';

import CodeMirror from "preact-codemirror";
import 'codemirror/mode/yaml/yaml'
import 'codemirror/mode/stex/stex'
import 'codemirror/theme/elegant.css'

import Header from './header';

import style from './style.css';

_.templateSettings = {
	interpolate: /<<(.+?)>>/g
};

const DEFAULT_YAML_DATA = `world: 'World'`;
const DEFAULT_LATEX_TEMPLATE = `\\documentclass{article}
\\usepackage{graphicx}
\\begin{document}
Hello << world >>! \\\\
\\end{document}`;


// TODO create "projects" with localstorage for each project

export default class App extends Component {

	yamlInstance = null;
	latexInstance = null;

	compile = async () => {
		if(!this.yamlInstance || !this.latexInstance) {
			console.error("Error with code mirrors instances. Try to reload the page.");
			return;
		}

		// TODO manage errors while parsing/templating

		const yaml = this.yamlInstance.getValue()
		const json = jsYaml.safeLoad(yaml);
		console.log("yaml to json:", json)
		
		// TODO use https://olado.github.io/doT/index.html instead of underscore.template
		const latex = this.latexInstance.getValue()
		const latexCompiled = _.template(latex)(json)
		console.log("latex compiled with data:", latexCompiled)
		

		const res = await fetch('https://latex.ytotech.com/builds/sync', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			responseType: 'blob',
			body: JSON.stringify({
				compiler: "pdflatex", // TODO select for the compiler between availables ones
				resources: [
					{
						main: true,
						content: latexCompiled
					}
				]
			})
		})
		// TODO catch and display errors
		const blob = await res.blob();

		// TODO put the name of the current project
		saveAs(blob, 'default.pdf');
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

				<button class={style.compile} onClick={this.compile}>Convert to PDF</button>
			</div>
		);
	}
}
