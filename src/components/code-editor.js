import { h, Component } from 'preact';

import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css'

export default class CodeEditor extends Component {

	codeMirror = null
    textareaElement = null

    componentDidMount () {
		console.log(this.textareaElement)
		this.codeMirror = CodeMirror.fromTextArea(this.textareaElement, this.props.options);
		console.log(this.codeMirror)
		this.codeMirror.on('change', this.codemirrorValueChanged);
		this.codeMirror.setValue(this.props.value);
	}

	componentWillUnmount () {
		if (this.codeMirror) {
			this.codeMirror.toTextArea();
		}
	}

	onChange(doc, change) {
		if (this.props.onChange && change.origin !== 'setValue') {
			this.props.onChange(doc.getValue(), change);
		}
	}

	render() {
		return (
			<div className="code-editor">
				<textarea
					ref={ref => this.textareaElement = ref}
					defaultValue={this.props.value}
				/>
			</div>
		);
	}
}
