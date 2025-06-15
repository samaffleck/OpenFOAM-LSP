# OpenFOAM Language Server

A lightweight [Language Server Protocol] based on the following repo (https://github.com/semanticart/minimum-viable-vscode-language-server-extension). We implement modern editor support for [OpenFOAM](https://openfoam.org/).

> ✨ Instant hover docs, semantic highlighting, and keyword autocompletion.

---

## 🚀 Features

- **Hover Tooltips** – Descriptions for OpenFOAM keywords like `FoamFile`, `deltaT`, `boundaryField`, etc.
- **Semantic Highlighting** – Colors dictionary keys, values, strings, comments, and user-defined parameters.
- **Autocomplete** – Completion suggestions for valid OpenFOAM keywords.

---

## 📦 Install

1. Clone the repo
  ```bash
  git clone https://github.com/samaffleck/OpenFOAM-LSP.git
  cd OpenFOAM-LSP
  ```

2. Install dependencies:
  ```bash
  npm install
  ```

3. Build the server and client:
  ```bash
  npm run compile
  ```

4. Lanuch the client (for stdio testing or development):
  Open the Run and Debug view and press "Launch Client" (or press F5). This will open a [Extension Development Host] VS Code window.


## License

MIT License © 2025 MeckHack2025
