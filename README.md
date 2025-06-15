# OpenFOAM Language Server (LSP)

A lightweight [Language Server Protocol] based on the following repo (https://microsoft.github.io/language-server-protocol/) implementation that adds modern editor support for [OpenFOAM](https://openfoam.org/) dictionary files.

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
  npm install

3. Build the server and client:
  npm run build

4. Lanuch the client (for stdio testing or development):
  npm run start


## License

MIT License © 2025 Sam Affleck
