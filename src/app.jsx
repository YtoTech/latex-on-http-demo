// TODO Drop preact, the webpack build is crazy.
import { h,  } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import doT from 'dot';
import jsYaml from 'js-yaml'
import { saveAs } from 'file-saver';

import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import { stex } from '@codemirror/legacy-modes/mode/stex';
import { yaml as yamlLang } from '@codemirror/legacy-modes/mode/yaml';

import { json as jsonLang, jsonLanguage } from '@codemirror/lang-json';


// import 'codemirror/mode/yaml/yaml'
// import 'codemirror/mode/stex/stex'
// import 'codemirror/mode/javascript/javascript'
// import 'codemirror/theme/elegant.css'

import style from './style.css';

import Header from './components/header';

import PROPOSAL_TEMPLATE from './templates/proposal';

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

	const onTemplateEntryChange = (entryKey, newValue, saveToLocalStorage = true) => {
		const templatesUpdated = [...templates]
		templatesUpdated[currentTemplateIndex] = {
			...templatesUpdated[currentTemplateIndex],
			[entryKey]: newValue,
		};
		
		if (saveToLocalStorage) {
			saveTemplatesToLocalStorage(templatesUpdated);
		}
		setTemplates(templatesUpdated);
	}

	const compileTemplate = () => {
		// TODO display errors while parsing/templating
		//  --> On the fly / change.

		// Save templates to localStorage on compile.
		console.log(templates);
		console.log(template.latexTemplate);
		saveTemplatesToLocalStorage(templates);

		// yaml to json
		const yamlSpaces = template.yamlData.replace(/\t/g, '    ')
		console.log('yaml', yamlSpaces)
		const jsonData = jsYaml.load(yamlSpaces);
		setJsonData(JSON.stringify(jsonData, null, 2));
		console.log("yaml to json:", jsonData)
		
		// Compile latex template with data
		const latexCompiled = doT.template(template.latexTemplate)(jsonData)
		setLatexCodeCompiled(latexCompiled);
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
				<div class="input" >
					<span>Template: </span>
					<select value={currentTemplateIndex} onChange={onTemplateSelection} >
						{
							templates.map((template, idx) => (
								<option key={idx} value={idx}>{template.name}</option>
							))
						}
						<option value={templates.length}>&gt; Add new template</option>
					</select>
				</div>
				<br />
				<div class="input">
					<span>Name: </span>
					<input
						type="text" value={template.name}
						onChange={e => onTemplateEntryChange('name', e.target.value)}	
					/>
				</div>
				<div class="input" >
					<span>Compiler: </span>
					<select
						value={template.compiler}
						onChange={e => onTemplateEntryChange('compiler', e.target.value)}	
					>
						{
							AVAILABLE_COMPILERS.map(compiler => (
								<option key={compiler} value={compiler}>{compiler}</option>
							))
						}
					</select>
				</div>
				<button class="convert" onClick={compileTemplate}>
					Compile template
				</button>
				<button
					class="convert"
					onClick={convertToPdf}
					disabled={isCompiling}
				>
					{!isCompiling ? 'Convert to PDF' : 'Converting...'}
				</button>
			</div>

			<div style={{ clear: 'both' }} />

			<div class="source" >
				<h3>Source data (yaml)</h3>
				<CodeMirror
					value={template.yamlData}
					onChange={v => onTemplateEntryChange('yamlData', v, false)}
					height="200px"
					extensions={[StreamLanguage.define(yamlLang)]}
				/>
			</div>

			<div class="source" >
				<h3>Source template (LaTeX)</h3>
				<CodeMirror
					value={template.latexTemplate}
					onChange={v => onTemplateEntryChange('latexTemplate', v, false)}
					height="200px"
					extensions={[StreamLanguage.define(stex)]}
				/>
			</div>

			{ jsonData &&
				<div class="source" >
					<h3>Generated data (json)</h3>
					<CodeMirror
						value={jsonData}
						extensions={[jsonLang({ base: jsonLanguage, codeLanguages: languages })]}
						readOnly
					/>
				</div>
			}

			{ latexCodeCompiled &&
				<div class="source" >
					<h3>Generated LaTeX with data</h3>
					<CodeMirror
						value={latexCodeCompiled}
						extensions={[StreamLanguage.define(stex)]}
						readOnly
					/>
				</div>
			}

			{ latexOnHttpPayload &&
				<div class="sourceFull" >
					<h3>Payload for LaTeX-on-HTTP (json) </h3>
					<CodeMirror
						value={latexOnHttpPayload}
						extensions={[jsonLang({ base: jsonLanguage, codeLanguages: languages })]}
						readOnly
					/>
				</div>
			}

		</div>
	);
}
