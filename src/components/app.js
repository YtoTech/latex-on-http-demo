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
	evaluate:    /<<([\s\S]+?)>>/g,
	interpolate: /<<=([\s\S]+?)>>/g,
	encode:      /<<!([\s\S]+?)>>/g,
	use:         /<<#([\s\S]+?)>>/g,
	define:      /<<##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#>>/g,
	conditional: /<<\?(\?)?\s*([\s\S]*?)\s*>>/g,
	iterate:     /<<~\s*(?:<<|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*>>)/g,
	varname: 'it',
	strip: false,
	append: true,
	selfcontained: false
};

const AVAILABLE_COMPILERS = ['pdflatex', 'xelatex', 'lualatex', 'platex', 'uplatex', 'context']

// TODO externalize these
const DEFAULT_YAML_DATA = `world: 'World'`;
const DEFAULT_LATEX_TEMPLATE = `\\documentclass{article}
\\usepackage{graphicx}
\\begin{document}
Hello <<= it.world >>! \\\\
\\end{document}`;

const DEFAULT_TEMPLATES = [{
	name: "hello-world",
	yamlData: DEFAULT_YAML_DATA,
	compiler: 'pdflatex',
	latexTemplate: DEFAULT_LATEX_TEMPLATE
}]

// TODO create "projects" with localstorage for each project

export default class App extends Component {

	yamlInstance = null;
	latexInstance = null;

	state = {
		templates: null,
		currentTemplateIndex: null,

		jsonData: null,
		latexCompiled: null,
		payload: null
	}

	componentWillMount() {
		// localStorage.clear()
		let templates = localStorage.getItem('templates')
		if (!templates) {
			templates = DEFAULT_TEMPLATES
		} else {
			console.log(templates)
			templates = JSON.parse(templates)
		}

		let currentTemplateIndex = parseInt(localStorage.getItem('currentTemplateIndex') || "0", 10)

		this.setState({
			templates,
			currentTemplateIndex
		})
	}

	onCompilerChange = e => {
		const templates = [...this.state.templates]
		const template = templates[this.state.currentTemplateIndex]
		template.compiler = e.target.value
		
		localStorage.setItem('templates', JSON.stringify(templates))
		this.setState({ templates })
	}

	// TODO factorize change logic
	onNameChange = e => {
		const templates = [...this.state.templates]
		const template = templates[this.state.currentTemplateIndex]
		template.name = e.target.value
		
		localStorage.setItem('templates', JSON.stringify(templates))
		this.setState({ templates })
	}

	onTemplateChange = e => {
		const idx = parseInt(e.target.value, 10)
		if (idx === this.state.currentTemplateIndex) {
			return
		}

		if (idx === this.state.templates.length) {
			this.setState({
				templates: [...this.state.templates, Object.assign({}, DEFAULT_TEMPLATES[0])], 
				currentTemplateIndex: idx
			});
		} else {
			this.setState({ currentTemplateIndex: idx });
		}

		localStorage.setItem('currentTemplateIndex', idx)
		this.setState({ 
			jsonData: null,
			latexCompiled: null,
			payload: null
		});
	}

	compile = () => {
		if(!this.yamlInstance || !this.latexInstance) {
			console.error("Error with code mirrors instances. Try to reload the page.");
			return;
		}

		// TODO display errors while parsing/templating

		const templates = [...this.state.templates]
		const template = templates[this.state.currentTemplateIndex]

		// Get inputs
		const yamlData = this.yamlInstance.getValue()
		const latexTemplate = this.latexInstance.getValue()
		template.yamlData = yamlData
		template.latexTemplate = latexTemplate

		localStorage.setItem('templates', JSON.stringify(templates))
		this.setState({ templates })

		// yaml to json
		const yamlSpaces = yamlData.replace(/\t/g, '    ')
		console.log('yaml', yamlSpaces)
		const jsonData = jsYaml.load(yamlSpaces);
		this.setState({ jsonData: JSON.stringify(jsonData, null, 2) })
		console.log("yaml to json:", jsonData)
		
		// Compile latex template with data
		const latexCompiled = doT.template(latexTemplate)(jsonData)
		this.setState({ latexCompiled })
		console.log("latex compiled with data:", latexCompiled)
		
		const payload = {
			compiler: template.compiler,
			resources: [
				{
					main: true,
					content: latexCompiled
				}
			]
		}
		this.setState({ payload: JSON.stringify(payload, null, 2) })
		console.log("payload:", payload)

		return payload
	}

	convertToPdf = async () => {
		const payload = this.compile()

		const res = await fetch('https://latex.ytotech.com/builds/sync', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			responseType: 'blob',
			body: JSON.stringify(payload)
		})
		// TODO catch and display errors
		const blob = await res.blob();

		// TODO put the name of the current project
		saveAs(blob, 'default.pdf');
	}

	render() {

		const template = this.state.templates[this.state.currentTemplateIndex]

		return (
			<div id="app">
				<Header />
				<div>
					<div class={style.input} >
						<span>Template: </span>
						<select value={this.state.currentTemplateIndex} onChange={this.onTemplateChange} >
							{
								this.state.templates.map((template, idx) => (
									<option value={idx}>{template.name}</option>
								))
							}
							<option value={this.state.templates.length}>&gt; Add new template</option>
						</select>
					</div>
					<br />
					<div class={style.input}>
						<span>Name: </span>
						<input type="text" value={template.name} onChange={this.onNameChange} />
					</div>
					<div class={style.input} >
						<span>Compiler: </span>
						<select value={template.compiler} onChange={this.onCompilerChange} >
							{
								AVAILABLE_COMPILERS.map(compiler => (
									<option value={compiler}>{compiler}</option>
								))
							}
						</select>
					</div>
					<button class={style.convert} onClick={this.compile}>Compile template</button>
					<button class={style.convert} onClick={this.convertToPdf}>Convert to PDF</button>
				</div>

				<div style={{ clear: 'both' }} />

				<div class={style.source} >
					<h3>Source data (yaml)</h3>
					<CodeMirror
						code={template.yamlData}
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
						code={template.latexTemplate}
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
						<h3>Payload for LaTeX-on-HTTP (json) </h3>
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

			</div>
		);
	}
}
