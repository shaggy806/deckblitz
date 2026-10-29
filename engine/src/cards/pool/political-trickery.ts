import { defineCard } from "../define.js";

// Rule 701.12b: nothing happens if one player controls both as it resolves,
// or if either target is illegal.
export default defineCard({
  name: "Political Trickery",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Exchange control of target land you control and target land an opponent controls. (This effect lasts indefinitely.)",
  targets: ["land-you-control", { kind: "permanent", whose: "opponent", filter: { type: "land" } }],
  effect: { kind: "exchange-control", objects: [0, 1] },
});
