import { defineCard } from "../define.js";

// EDHREC rank 5955.
// Each proliferate its own choice (the ruling); nobody can respond between them.

export default defineCard({
  name: "Expansion Algorithm",
  manaCost: "{X}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Proliferate X times. (To proliferate, choose any number of permanents and/or players, then give each another counter of each kind already there.)",
  effect: { kind: "repeat", times: "x", effect: { kind: "proliferate" } },
});
