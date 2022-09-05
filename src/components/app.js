import { h,  } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import doT from 'dot';
import jsYaml from 'js-yaml'
import { saveAs } from 'file-saver';

import CodeMirror from "preact-codemirror";
import 'codemirror/mode/yaml/yaml'
import 'codemirror/mode/stex/stex'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/theme/elegant.css'

import style from './style.css';

import Header from './header';

import PROPOSAL_TEMPLATE from '../templates/proposal';

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

const DEFAULT_TEMPLATES = [
	{
		name: "hello-world",
		yamlData: DEFAULT_YAML_DATA,
		compiler: 'pdflatex',
		latexTemplate: DEFAULT_LATEX_TEMPLATE
	},
	// PROPOSAL_TEMPLATE,
]

// TODO Delete or reset templates
// TODO Compilation indicator (overlay)
// TODO create "projects" with localstorage for each project

// LocalStorage.

const LS_MAIN_ITEM_KEY = 'templates'
const LS_INDEX_ITEM_KEY = 'currentTemplateIndex'

function loadsTemplateFromLocalStorage() {
	let templates;
	try {
		templates = localStorage.getItem(LS_MAIN_ITEM_KEY);
		console.log(templates);
		templates = JSON.parse(templates);
		// TODO Check them. (add version)
	} catch(e) {
		console.error(`Error loading templates from localStorage: ${e}`);
	}
	if (!templates) {
		templates = DEFAULT_TEMPLATES;
	}

	let currentTemplateIndex;
	try {
		currentTemplateIndex = parseInt(localStorage.getItem(LS_INDEX_ITEM_KEY) || "0", 10)
	} catch(e) {
		console.error(`Error loading templates from localStorage: ${e}`);
	}
	if (currentTemplateIndex > templates.length-1) {
		currentTemplateIndex = 0;
	}
	return [templates, currentTemplateIndex];
}

function saveTemplatesToLocalStorage(templates) {
	try {
		localStorage.setItem(LS_MAIN_ITEM_KEY, JSON.stringify((templates)));
	} catch(e) {
		console.error(`Error saving templates to localStorage: ${e}`);
	}
}

function saveTemplateIndexToLocalStorage(templateIndex) {
	try {
		localStorage.setItem(LS_INDEX_ITEM_KEY, templateIndex);
	} catch(e) {
		console.error(`Error saving templates to localStorage: ${e}`);
	}
}

export default function LatexOnHttpDemoApp() {
	let yamlCodeEditorInstance;
	let latexCodeEditorInstance;
	const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
	const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
	const [jsonData, setJsonData] = useState(null);
	const [latexCodeCompiled, setLatexCodeCompiled] = useState(null);
	const [latexOnHttpPayload, setLatexOnHttpPayload] = useState(null);
	const [isCompiling, setIsCompiling] = useState(false);
	// TODO Store response, show error logs or PDF (with PDF.js).
	// const [latexOnHttpResponse, setLatexOnHttpResponse] = useState(null);
	useEffect(() => {
		// Loads templates from localStorage.
		const [
			initialTemplates, initialCurrentTemplateIndex
		] = loadsTemplateFromLocalStorage();
		setTemplates(initialTemplates);
		setCurrentTemplateIndex(initialCurrentTemplateIndex);
		return () => {
			// Optional: Any cleanup code
		};
	}, []);

	console.log(templates);

	const resetCompilationContext = () => {
		setJsonData(null);
		setLatexCodeCompiled(null);
		setLatexOnHttpPayload(null);
	}

	const onTemplateSelection = e => {
		const idx = parseInt(e.target.value, 10)
		if (idx === currentTemplateIndex) {
			return
		}

		if (idx === templates.length) {
			// Add new template.
			setTemplates([...templates, Object.assign({}, DEFAULT_TEMPLATES[0])]);
			setCurrentTemplateIndex(idx);
		} else {
			setCurrentTemplateIndex(idx);
		}

		saveTemplateIndexToLocalStorage(idx)
		resetCompilationContext()
	}

	const onTemplateEntryChange = (entryKey, e) => {
		const templatesUpdated = [...this.state.templates]
		const templateUpdated = {
			...templatesUpdated[currentTemplateIndex],
			[entryKey]: e.target.value,
		};
		
		saveTemplatesToLocalStorage(templates);
		setTemplates(templates);
	}

	const compileTemplate = () => {
		if(!yamlCodeEditorInstance || !latexCodeEditorInstance) {
			console.error("Error with code mirrors instances. Try to reload the page.");
			return;
		}

		// TODO display errors while parsing/templating
		const templatesUpdated = [...templates]

		// Get inputs
		// TODO Really bad: use onChange to set editor values in
		// react state. Make the editors controlled.
		const yamlData = yamlCodeEditorInstance.getValue()
		const latexTemplate = latexCodeEditorInstance.getValue()
		const templateUpdated = {
			...templatesUpdated[currentTemplateIndex],
			yamlData,
			latexTemplate,
		};

		saveTemplatesToLocalStorage(templates);
		setTemplates(templates);

		// yaml to json
		const yamlSpaces = yamlData.replace(/\t/g, '    ')
		console.log('yaml', yamlSpaces)
		const jsonData = jsYaml.load(yamlSpaces);
		setJsonData(JSON.stringify(jsonData, null, 2));
		console.log("yaml to json:", jsonData)
		
		// Compile latex template with data
		const latexCompiled = doT.template(latexTemplate)(jsonData)
		setLatexCodeCompiled(latexCompiled);
		console.log("latex compiled with data:", latexCompiled)
		
		const payload = {
			compiler: templateUpdated.compiler,
			resources: [
				{
					main: true,
					content: latexCompiled
				}
			]
		}
		setLatexOnHttpPayload(JSON.stringify(payload, null, 2));
		console.log("payload:", payload)

		return payload
	}

	const convertToPdf = async () => {
		const payload = compileTemplate()
		
		setIsCompiling(true);
		const res = await fetch('https://latex.ytotech.com/builds/sync', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			responseType: 'blob',
			body: JSON.stringify(payload)
		})
		try {
			// TODO catch and display errors
			const blob = await res.blob();

			// TODO put the name of the current project
			saveAs(blob, 'default.pdf');
		} catch(e) {
			console.error(`Error LaTeX-on-HTTP response handling: ${e}`);
		} finally {
			setIsCompiling(false);
		}
	}

	const template = templates[currentTemplateIndex]

	return (
		<div id="app">
			<Header />
			<div>
				<div class={style.input} >
					<span>Template: </span>
					<select value={currentTemplateIndex} onChange={onTemplateSelection} >
						{
							templates.map((template, idx) => (
								<option value={idx}>{template.name}</option>
							))
						}
						<option value={templates.length}>&gt; Add new template</option>
					</select>
				</div>
				<br />
				<div class={style.input}>
					<span>Name: </span>
					<input
						type="text" value={template.name}
						onChange={e => onTemplateEntryChange('name', e)}	
					/>
				</div>
				<div class={style.input} >
					<span>Compiler: </span>
					<select
						value={template.compiler}
						onChange={e => onTemplateEntryChange('compiler', e)}	
					>
						{
							AVAILABLE_COMPILERS.map(compiler => (
								<option value={compiler}>{compiler}</option>
							))
						}
					</select>
				</div>
				<button class={style.convert} onClick={compileTemplate}>
					Compile template
				</button>
				<button
					class={style.convert}
					onClick={convertToPdf}
					disabled={isCompiling}
				>
					{!isCompiling ? 'Convert to PDF' : 'Converting...'}
				</button>
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
						yamlCodeEditorInstance = instance;
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
						latexCodeEditorInstance = instance;
					}}
				/>
			</div>

			{ jsonData &&
				<div class={style.source} >
					<h3>Generated data (json)</h3>
					<CodeMirror
						code={jsonData}
						config={{
							lineNumbers: true,
							mode: 'application/json',
							readOnly: true
						}}
					/>
				</div>
			}

			{ latexCodeCompiled &&
				<div class={style.source} >
					<h3>Generated LaTeX with data</h3>
					<CodeMirror
						code={latexCodeCompiled}
						config={{
							lineNumbers: true,
							mode: 'text/x-stex',
							readOnly: true
						}}
					/>
				</div>
			}

			{ latexOnHttpPayload &&
				<div class={style.sourceFull} >
					<h3>Payload for LaTeX-on-HTTP (json) </h3>
					<CodeMirror
						code={latexOnHttpPayload}
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
