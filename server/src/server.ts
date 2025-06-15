import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  TextDocumentSyncKind,
  InitializeResult,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";

import {
  SemanticTokensParams,
  SemanticTokens,
  SemanticTokensBuilder
} from "vscode-languageserver/node";

import { Hover, HoverParams, MarkupKind } from "vscode-languageserver";

import {
  CompletionItem,
  CompletionItemKind,
  CompletionParams
} from 'vscode-languageserver';

import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

const connection = createConnection(ProposedFeatures.all);

const foamDictionaryKeywords = [
  "FoamFile",
  "p",
  "pFinal",
  "U",
  "ddtSchemes",
  "gradSchemes",
  "divSchemes",
  "laplacianSchemes",
  "interpolationSchemes",
  "snGradSchemes",
  "solvers",
  "boundaryField",
  "PISO"
];

const foamLValueKeyword = [
  "convertToMeters",
  "application",
  "startFrom",
  "startTime",
  "stopAt",
  "endTime",
  "deltaT",
  "timeStep",
  "writeControl",
  "writeInterval",
  "purgeWrite",
  "writeFormat",
  "writePrecision",
  "writeCompression",
  "timeFormat",
  "timePrecision",
  "runTimeModifiable",
  "default",
  "pRefCell",
  "pRefValue",
  "dimensions",
  "internalField",
  "nu",
  "type",
  "value",
  "format",
  "class",
  "object",
  "location",
  "nCorrectors",
  "nNonOrthogonalCorrectors",
  "tolerance",
  "relTol",
  "preconditioner",
  "solver",
  "smoother",
  "grad",
  "div",
  "phi"
];

const foamListKeywords = [
  "blocks",
  "vertices",
  "hex",
  "simpleGrading",
  "boundary",
  "faces"
];

const foamRValueKeyword = [
  "fixedValue",
  "zeroGradient",
  "empty",
  "calculated",
  "codedFixedValue",
  "uniform",
  "nonuniform",
  "noSlip",
  "PCG",
  "DIC",
  "smoothSolver",
  "symGaussSeidel",
  "GaussSeidel",
  "ascii",
  "dictionary",
  "fvSolution",
  "volScalarField",
  "off",
  "on",
  "general",
  "true",
  "false",
  "wall"
];

const hoverInfo: Record<string, string> = {
  FoamFile: "Standard header that stores file metadata: version, format, class, object, location.",
  convertToMeters: "Scaling factor that multiplies every vertex in blockMeshDict (e.g. 0.001 for mm).",
  blocks: "Ordered list of hexahedral blocks: (vertex labels) (cells) grading.",
  vertices: "Coordinate list of all vertices referenced by blocks.",
  hex: "Keyword identifying a structured hexahedral block (8 corners).",
  simpleGrading: "Expansion ratios (x y z) or multi-region tuples that stretch cells inside a block.",
  boundary: "Sub-dictionary that names each patch and its type inside blockMeshDict.",
  application: "Name of the solver or utility to execute when you run the case.",
  startFrom: "firstTime | latestTime | startTime – tells solver where to begin.",
  startTime: "Physical time at which the simulation starts when startFrom=startTime.",
  stopAt: "endTime | writeNow | noWriteNow | nextWrite – stopping criterion.",
  endTime: "Physical time when simulation stops if stopAt=endTime.",
  deltaT: "Time-step size (s).",
  writeControl: "Event that triggers writing (timeStep, runTime, adjustableRunTime, cpuTime, clockTime).",
  writeInterval: "Interval associated with writeControl (steps or seconds).",
  purgeWrite: "Keep only N most recent time directories (0 disables purging).",
  writeFormat: "ascii (default) or binary output format.",
  writePrecision: "Significant digits written when writeFormat=ascii.",
  writeCompression: "on/off switch for gzip compression of written files.",
  timeFormat: "fixed | scientific | general – numbering style of time directories.",
  timePrecision: "Digits used with timeFormat=fixed or scientific.",
  runTimeModifiable: "yes/no switch to reread dictionaries at every time step.",
  ddtSchemes: "Time-derivative discretisation schemes (Euler, backward, CrankNicolson, …).",
  gradSchemes: "Gradient discretisation schemes (e.g. Gauss linear).",
  divSchemes: "Divergence discretisation schemes (e.g. Gauss upwind).",
  laplacianSchemes: "Laplacian discretisation schemes (requires an interpolation and snGrad scheme).",
  interpolationSchemes: "Cell-centre to face interpolation schemes.",
  snGradSchemes: "Surface-normal gradient schemes.",
  solvers: "Linear-solver settings for each field (PCG, GAMG, smoothSolver …).",
  dimensions: "SI base dimensions vector [M L T Θ I N J] of a field.",
  internalField: "Initial value of the field inside the domain (uniform or nonuniform).",
  boundaryField: "Sub-dictionary defining the boundary condition for every patch.",
  type: "Boundary-condition or object type inside a sub-dictionary.",
  value: "Fixed value assigned by many boundary conditions (uniform or nonuniform list).",
  PISO: "Sub-dictionary that holds nCorrectors, nNonOrthogonalCorrectors, etc. for PISO loop.",
  format: "Entry in FoamFile header declaring ascii or binary.",
  class: "Entry in FoamFile header giving C++ class (e.g. volVectorField).",
  object: "Entry in FoamFile header giving the object/file name.",
  location: "Entry in FoamFile header giving relative path (e.g. \"system\").",
  timeStep: "Function-object that can modify deltaT on-the-fly (e.g. coded setDeltaT).",
  faces: "PolyMesh file listing vertex indices for every face in the mesh.",
  nCorrectors: "Number of pressure–velocity correction loops per time step.",
  nNonOrthogonalCorrectors: "Number of pressure equation corrections accounting for mesh non-orthogonality.",
  tolerance: "Absolute convergence criterion. Solver stops when the residual falls below this value.",
  relTol: "Relative convergence criterion. Solver will stop if residual drops by this factor relative to the initial residual of the current time step.",
  "PCG": "Preconditioned Conjugate Gradient method",
  preconditioner: "Improves convergence of the iterative solver by transforming the matrix system into an equivalent form that converges faster.",
  "DIC": "Diagonal incomplete Cholesky preconditioner. Commonly used with PCG for pressure solves.",
  solver: "Specifies the main iterative solver algorithm.",
  smoothSolver: "smoothSolver is a flexible solver framework that wraps around various smoothing (relaxation) methods.\nIt’s often used for non-symmetric matrices (e.g., velocity equations). \nSuitable for cases where direct solvers are too expensive or not feasible.",
  smoother: "Defines the actual smoothing (relaxation) method used within smoothSolver",
  symGaussSeidel: "Symmetric Gauss-Seidel smoothing. \nGauss-Seidel is a classic iterative method that updates variables sequentially. \nSymmetric version runs a forward and then a backward sweep through the matrix to improve convergence. \nIt’s more stable and accurate than simple Gauss-Seidel. \nOther possible values: GaussSeidel, DILU, DIC, none.",
  fixedValue: "Fixed value boundary condition. Other possible values: zeroGradient, empty, calculated, codedFixedValue, uniform, nonuniform, noSlip.",
  GaussSeidel: "Gauss-Seidel is a classic iterative method that updates variables sequentially. \nSymmetric version runs a forward and then a backward sweep through the matrix to improve convergence.\nOther possible values: GaussSeidel, DILU, DIC, none.",
  nu: "Kinemaic viscosity of the fluid.",
  p: "Kinematic pressure. Defined as static pressure/density.",
  u: "Velocity of the fluid.",
  grad: "Gradient operator",
  div: "Divergence operator",
  phi: "Flux through the cell (surfaceScalarField).\nFor incompressible flows phi=U. \nFor compressible flows phi=rho*U."
};

const foamTokenTypes = [
  "namespace",       // dictionary class/type
  "keyword",         // system-level control keywords
  "type",            // boundary condition types
  "comment",         // comments
  "number",          // numeric values
  "string",          // quoted strings
  "parameter"        // patch names
];

connection.languages.semanticTokens.on((params: SemanticTokensParams): SemanticTokens => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return { data: [] };

  const text = document.getText();
  const builder = new SemanticTokensBuilder();
  const lines = text.split(/\r?\n/g);
  let insideBlockComment = false;

  for (let line = 0; line < lines.length; line++) {
    const text = lines[line];
    const trimmed = text.trim();

    /* Check for comments */
    if (insideBlockComment) {
      builder.push(line, 0, text.length, 3, 0);
      if (text.includes("*/")) {
        insideBlockComment = false;
      }
      continue;
    }

    if (trimmed.startsWith("/*")) {
      insideBlockComment = true;
      builder.push(line, 0, text.length, 3, 0);
      continue;
    }

    if (trimmed.startsWith("//")) {
      builder.push(line, 0, text.length, 3, 0);
      continue;
    }

    /* Check for keywords */
    const words = text.split(/\b/);
    let char = 0;
    for (const word of words) {
      const token = word.trim();
      if (!token) {
        char += word.length;
        continue;
      }

      if (foamDictionaryKeywords.includes(token)) { // dictionary
        builder.push(line, char, token.length, 0, 0);
      } else if (foamListKeywords.includes(token)) { // list
        builder.push(line, char, token.length, 1, 0);
      } else if (foamLValueKeyword.includes(token)) { // variable
        builder.push(line, char, token.length, 2, 0);
      } else if (foamRValueKeyword.includes(token)) { // parameter
        builder.push(line, char, token.length, 6, 0);
      }
      
      char += word.length;
    }

    // Match number literals
    const numberRegex = /\b[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?\b/g;
    let match;
    while ((match = numberRegex.exec(text)) !== null) {
      builder.push(line, match.index, match[0].length, 4, 0);
    }

    // Match quoted strings
    const stringRegex = /"([^"\\]*(\\.[^"\\]*)*)"/g;
    let stringMatch;
    while ((stringMatch = stringRegex.exec(text)) !== null) {
      builder.push(line, stringMatch.index, stringMatch[0].length, 5, 0);
    }
  }

  return builder.build();
});

const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

const tokenModifiers: string[] = [];

connection.onInitialize((params: InitializeParams): InitializeResult => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      hoverProvider: true,
      completionProvider: {
        triggerCharacters: ['.', '"', ' '],
      },
      semanticTokensProvider: {
        legend: {
          tokenTypes: foamTokenTypes, 
          tokenModifiers: tokenModifiers
        },
        full: true,
        range: false 
      }
    }
  };
});

connection.onHover((params: HoverParams): Hover | null => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return null;

  const position = params.position;
  const lineText = document.getText({
    start: { line: position.line, character: 0 },
    end: { line: position.line + 1, character: 0 }
  });

  // Find the word under the cursor
  const wordRegex = /\b[A-Za-z_][A-Za-z0-9_]*\b/g;
  let match: RegExpExecArray | null;
  while ((match = wordRegex.exec(lineText)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    if (position.character >= start && position.character <= end) {
      const word = match[0];
      const doc = hoverInfo[word];
      if (doc) {
        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: `**${word}**\n\n${doc}`
          }
        };
      }
    }
  }

  return null;
});

const foamKeywords = Object.keys(hoverInfo);

connection.onCompletion(
  (params: CompletionParams): CompletionItem[] => {
    return foamKeywords.map((keyword): CompletionItem => ({
      label: keyword,
      kind: CompletionItemKind.Keyword,
      detail: 'OpenFOAM keyword',
      documentation: {
        kind: MarkupKind.Markdown,
        value: `**${keyword}**\n\n${hoverInfo[keyword] ?? 'No documentation available.'}`
      }
    }));
  }
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  const text = textDocument.getText();
  const diagnostics: Diagnostic[] = [];

  const lines = text.split(/\r?\n/g);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    let braceDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const openCount = (line.match(/{/g) || []).length;
      const closeCount = (line.match(/}/g) || []).length;

      braceDepth += openCount - closeCount;

      if (braceDepth < 0) {
        diagnostics.push({
          severity: DiagnosticSeverity.Error,
          range: {
            start: { line: i, character: 0 },
            end: { line: i, character: line.length }
          },
          message: "Unexpected closing brace '}' — no matching opening brace.",
          source: "openfoam-lsp"
        });
        braceDepth = 0; // Reset to avoid cascading errors
      }
    }

    if (braceDepth > 0) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: {
          start: { line: lines.length - 1, character: 0 },
          end: { line: lines.length - 1, character: lines[lines.length - 1].length }
        },
        message: `Missing ${braceDepth} closing brace(s) '}'.`,
        source: "openfoam-lsp"
      });
    }
  }

  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

documents.onDidChangeContent(change => {
  validateTextDocument(change.document);
});
