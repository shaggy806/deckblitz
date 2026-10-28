import { defineCard } from "../define.js";

// EDHREC rank 5153. Overloaded, it targets nothing and copies each artifact
// creature you control as it resolves.

export default defineCard({
  name: "March of Progress",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Choose target artifact creature you control. For each creature chosen this way, create a token that's a copy of it.\nOverload {6}{U} (You may cast this spell for its overload cost. If you do, change its text by replacing all instances of \"target\" with \"each.\")",
  targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", typesAnyOf: ["artifact"] } }],
  effect: { kind: "create-token-copy", of: 0, count: 1 },
  overload: {
    cost: "{6}{U}",
    effect: { kind: "create-token-copy", of: { each: { types: ["artifact", "creature"], controlledBy: "you" } }, count: 1 },
  },
});
