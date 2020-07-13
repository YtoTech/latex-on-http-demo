import { h, Component } from 'preact';
import _ from 'underscore';
import jsYaml from 'js-yaml'

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

export default class App extends Component {

	yamlInstance = null;
	latexInstance = null;

	async compile() {
		if(!this.yamlInstance || !this.latexInstance) {
			console.error("Error with code mirrors instances. Try to reload the page.");
			return;
		}

		// TODO manage errors while parsing/templating

		const yaml = this.yamlInstance.getValue()
		const json = jsYaml.safeLoad(yaml);
		console.log(json)
		
		const latex = this.latexInstance.getValue()
		const latexCompiled = _.template(latex)(json)
		console.log(latexCompiled)

		const res = await fetch('https://latex.ytotech.com/builds/sync', {
			method: 'POST',
			mode: 'no-cors',
			body: {
				compiler: "pdflatex",
				resources: [
					{
						main: true,
						content: latexCompiled
					}
				]
			}
		})
		console.log(res)
		// TODO make res body (pdf) downloadable
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

				<button class={style.compile} onClick={this.compile.bind(this)}>Compile</button>
			</div>
		);
	}
}
