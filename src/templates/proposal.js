// https://github.com/YtoTech/latex-on-http/blob/master/samples/quotes/mrzool-inspired/details.yml
// https://github.com/YtoTech/latex-on-http/blob/master/samples/quotes/mrzool-inspired/template-pandoc.tex

export const YAML_DATA = `world: 'World'`;

export const LATEX_TEMPLATE = String.raw`%!TEX TS-program = xelatex
%!TEX encoding = UTF-8 Unicode
% Inspired from mrzool Invoice Boilerplate template; source: https://github.com/mrzool/invoice-boilerplate

\documentclass[10pt, a4paper]{article}

% LAYOUT
%--------------------------------
\\usepackage{geometry} 
\geometry{a4paper, left=43mm, right=43mm, top=51mm, bottom=17mm}

% No page numbers
\pagenumbering{gobble}

% Left align
\\usepackage[document]{ragged2e}


% TYPOGRAPHY (Modified: for T1 fonts)
%--------------------------------
% You can choose a font on https://tug.org/FontCatalogue/
\\usepackage[T1]{fontenc}
\\usepackage{crimson}
\\usepackage[defaultsans]{opensans}

% Set paragraph break
\setlength{\parskip}{1em}

% Command required by how Pandoc handles the list conversion
\providecommand{\tightlist}{%
  \setlength{\itemsep}{0pt}\setlength{\parskip}{0pt}}

% TABLE CUSTOMIZATION
%--------------------------------
\\usepackage{spreadtab}
\\usepackage[compact]{titlesec} % For customizing title sections
\titlespacing*{\section}{0pt}{3pt}{-7pt} % Remove margin bottom from the title
\\usepackage{arydshln} % For the dotted line on the table
\renewcommand{\arraystretch}{1.5} % Apply vertical padding to table cells
\\usepackage{hhline} % For single-cell borders
\\usepackage{enumitem} % For customizing lists
\setlist{nolistsep} % No whitespace around list items
\setlist[itemize]{leftmargin=0.5cm} % Reduce list left indent
\setlength{\tabcolsep}{9pt} % Larger gutter between columns

% Boxes
%--------------------------------
\\usepackage{tcolorbox}
% Create box
% https://en.wikibooks.org/wiki/LaTeX/Boxes
% https://ctan.org/pkg/tcolorbox
% http://tex.stackexchange.com/questions/25903/how-to-put-a-long-piece-of-text-in-a-box
% http://tex.stackexchange.com/questions/102737/how-to-specify-height-and-width-of-fbox
{% raw %}
\newcommand{\cfbox}[2]{%
    \colorlet{currentcolor}{.}%
    {\color{#1}%
    \tcbox[nobeforeafter,colback=white,colframe=blue!75!black,boxrule=0.1pt,leftrule=1pt,arc=1.5pt,auto outer arc]{\color{currentcolor}#2}}%
}
{% endraw %}

% LANGUAGE
%--------------------------------
\\usepackage{polyglossia}
\setmainlanguage{english}

% PDF SETUP
%--------------------------------
\\usepackage[xetex, bookmarks, colorlinks, breaklinks]{hyperref}
\hypersetup
{
  pdfauthor={Max Mustermann},
  pdfsubject=Proposal Nr. 2020-07-24,
  pdftitle=Proposal Nr. 2020-07-24,
  linkcolor=blue,
  citecolor=blue,
  filecolor=black,
  urlcolor=blue
}


% To display custom date
% \\usepackage[nodayofweek]{datetime}
% \newdate{date}{01}{12}{1867}
% \date{\displaydate{date}}
% Use this instead of \today: % \displaydate{date}

% DOCUMENT
%--------------------------------
\begin{document}
\small
\ttfamily
\textsc{\textbf{Max Mustermann}}
\textbullet{} \textsc{Musterstraße 37}
\textbullet{} \textsc{12345 Musterstadt}

\vspace{1em}

\normalsize \ttfamily
Erika Mustermann\\
Musterallee 1\\
12345 Musterstadt\\
Germany\\

\vspace{6em}
\rmfamily

\huge{\textsc{Projet \#2020-07-24} }

\begin{flushright}
  \small
  Musterstadt, \today
\end{flushright}

\vspace{1em}

\normalsize \rmfamily

    \section*{\textsc{Object du projet}}
    Le présent devis porte sur \ldots{}

    La prestation consiste à \ldots{}

    Inclure un lien avec \\url{https://www.tesla.com}.
    \section*{\textsc{Définitions}}
    Tesla désigne le constructeur automobile de voitures électriques
    sportives et de luxe dont le siège social se situe à Palo Alto, dans
    la Silicon Valley, aux États-Unis.

    La Model 3 avait pour nom de code Tesla BlueStar. Son nom actuel fut
    annoncé le 16 juillet 201431,32. Plus compacte que la Model S, elle
    mesurerait 4,60 m. Tesla, avec cette nouvelle gamme, vise tout
    particulièrement le segment des berlines haut de gamme. Elle a été
    dévoilée officiellement le 31 mars 2016 et sera commercialisée à
    partir de fin 2017.
    \section*{\textsc{Contexte}}
    Tesla est une entreprise qui cherche à répandre et universaliser
    l'usage de véhicules électriques.

    Je fais une liste comme ça :

    \begin{itemize}
      \item Un point ;
      \item Un carré ;
      \item Mais il n'est pas carré ;
      \item Ok on a compris.
    \end{itemize}\bigskip

    Blablabla.

    Finalement \ldots{}

    YtoTech, to be, or not to be.

    Le présent devis a pour objectif d'établir \ldots{}
    \section*{\textsc{Documents utiles}}
    \begin{itemize}
      \item The mail from Elong Musk about launching this project;
      \item The photo of the sketch I have done on a napkin last night while eating my noodles.
    \end{itemize}

% \newpage

\normalsize \sffamily
\section*{\textsc{Proposal}}
\footnotesize
\newcounter{pos}
\setcounter{pos}{0}
\STautoround*{2} % Get spreadtab to always display the decimal part
 % Use comma as decimal separator

\begin{spreadtab}{{tabular}[t t t]{lp{8.2cm}r}}
  \hdashline[1pt/1pt]
  @ \noalign{\vskip 2mm} \textbf{Pos.} & @ \textbf{Description} & @ \textbf{Prices in EUR} \\ \hline
       @ \noalign{\vskip 2mm} \refstepcounter{pos} \thepos 
        & @ The first service provided 
         & 320.00\\ @ \noalign{\vskip 2mm} \refstepcounter{pos} \thepos 
        & @ And another one, with a list of details 
        \newline \begin{itemize} 
          \scriptsize \item Some more detailed explanation 
          \scriptsize \item of the service provided 
          \scriptsize \item Looking good 
           \end{itemize}
           & 245.00\\ @ \noalign{\vskip 2mm} \refstepcounter{pos} \thepos 
        & @ The last service provided 
         & 65.00\\ \noalign{\vskip 2mm} \hline
      @ & @ \multicolumn{1}{r}{Subtotal:}                & :={sum(c1:[0,-1])} \\ \hhline{~~-}
    @ & @ \multicolumn{1}{r}{VAT 20\%:}               & 20/100*[0,-1] \\ \hhline{~~-}
    @ & @ \multicolumn{1}{r}{\textbf{Total:}}   & \textbf{:={[0,-1]+[0,-2]}} \\ \hhline{~~-}
\end{spreadtab}


% \newpage

\normalsize \rmfamily
    \section*{\textsc{Lotissement de la prestation}}
    La prestation est organisée en plusieurs lots. Chaque lot fera
    l'objet d'une livraison et d'une facturation séparée. Le client
    décide de souscrire à la réalisation des prestations lot par lot.

    Le 1\textsuperscript{er} lot comprend :

    \begin{itemize}
      \item Création des configurations sur le CPQ.
    \end{itemize}\bigskip

    Le 2\textsuperscript{nd} lot comprend :

    \begin{itemize}
      \item Intégration de l'UI.
    \end{itemize}\bigskip
    \section*{\textsc{Propriété intellectuelle}}
    Les logiciels et dispositifs développés dans le cadre de la
    prestation, y compris tous les dispositifs de tests, deviendront la
    propriété de TODO Templateception après la réception et le paiement
    intégral des prestations associées au présent devis.
    \textbackslash{} Les logiciels et dispositifs dont la propriété
    intellectuelle est cédée sont ceux listés dans la section «
    Livrables ». \textbackslash{} Les logiciels et dispositifs
    non-listés ne sont pas cédés dans le cadre du présent contrat.
    \section*{\textsc{Livrables}}
    \begin{itemize}
      \item All On GitHub.
    \end{itemize}\bigskip

    \noindent Tout code source sera documenté ; il pourra être repris et
    étendu par d'autres prestataires et développeurs.
    \section*{\textsc{Hors périmètre}}
    Les éléments suivants sont considérés comme hors-périmètre de la
    prestation : \textbackslash{}

    \begin{itemize}
      \item Produire les véhicules ;
      \item Sauver la planète.
    \end{itemize}\bigskip

    Un devis pourra être demandé pour leur réalisation.
    \section*{\textsc{Garantie}}
    La prestation réalisée par YtoTech est soumise à une garantie de six
    (6) mois à compter de la date de solde de l'intégralité des
    prestations associées au devis. \textbackslash{} La garantie inclus
    la correction des défauts techniques constatés dans les logiciels
    livrables du présent devis. Des corrections mineures pourront être
    incluses, au jugement seul d'YtoTech.
    \section*{\textsc{Prise d'effet du devis}}
    Le présent devis et ses termes prendront effet à compter de la
    signature des parties en présence, ou à défaut du règlement par le
    client de l'acompte pour le premier lot de prestations.

% Flush to end of page
% http://tex.stackexchange.com/questions/31186/how-to-move-a-paragraph-to-the-bottom-of-the-page-without-vspace
\par\vspace*{\fill}

\section*{}
Fait à Musterstadt, le 24 juillet 2020.
\vspace{5mm}
\\
\ttfamily
\begin{minipage}[t][5.5cm][t]{7cm}
	\cfbox{gray}{\begin{minipage}[t][4cm][t]{6cm}
		\vspace{2mm}
        \footnotesize Mention « Lu et approuvé »
        \vfill
        \center Pour         \textbullet{} Musterstraße 37
                \textbullet{} 12345 Musterstadt
        	\end{minipage}}
	\medbreak
	\normalsize
\end{minipage}
\begin{minipage}[t][5.5cm][t]{7cm}
	\cfbox{gray}{\begin{minipage}[t][4cm][t]{6cm}
		\vspace{2mm}
        \footnotesize Mention « Lu et approuvé »
        \vfill
        \center Pour         \textbullet{} Erika Mustermann
                \textbullet{} Musterallee 1
                \textbullet{} 12345 Musterstadt
                \textbullet{} Germany
        	\end{minipage}}
	\medbreak
	% \small {{ document.client.contact.civility }} {{ document.client.contact.name }}{% if document.client.contact.role %}, {{ document.client.contact.role }}{% endif %}.
	\normalsize
\end{minipage}
\clearpage

\end{document}`;

export default {
  name: "proposal",
  yamlData: YAML_DATA,
  compiler: "xelatex",
  latexTemplate: LATEX_TEMPLATE,
};
