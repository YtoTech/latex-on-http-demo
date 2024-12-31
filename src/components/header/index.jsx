import { h } from 'preact';
import './style.css';

import GitHubLogo from '../../assets/GitHub-Mark-Light-64px.png'

const Header = () => (
	<header class="header">
		<h1>latex-on-http demo</h1>
		<nav>
			<a href="https://github.com/YtoTech/latex-on-http">built with LaTeX-on-HTTP
				<img src={GitHubLogo} alt="GitHub" />
			</a>
			<a href="https://github.com/YtoTech/latex-on-http-demo">Demo source code
				<img src={GitHubLogo} alt="GitHub" />
			</a>
		</nav>
	</header>
);

export default Header;
