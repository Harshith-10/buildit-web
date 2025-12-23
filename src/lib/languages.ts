export const LANGUAGE_NAMES: Record<string, string> = {
  python: "Python",
  java: "Java",
  javascript: "JavaScript",
  typescript: "TypeScript",
  c: "C",
  "c++": "C++",
  csharp: "C#",
  cpp: "C++",
  go: "Go",
  rust: "Rust",
  ruby: "Ruby",
  php: "PHP",
  swift: "Swift",
  kotlin: "Kotlin",
  scala: "Scala",
  haskell: "Haskell",
  lua: "Lua",
  perl: "Perl",
  r: "R",
  dart: "Dart",
  elixir: "Elixir",
  clojure: "Clojure",
  fsharp: "F#",
  ocaml: "OCaml",
  erlang: "Erlang",
  bash: "Bash",
  sh: "Shell",
  zsh: "Zsh",
};

export function getLanguageName(id: string): string {
  if (!id) return "";
  const name = LANGUAGE_NAMES[id.toLowerCase()];
  if (name) return name;

  // Fallback: Capitalize first letter
  return id.charAt(0).toUpperCase() + id.slice(1);
}
