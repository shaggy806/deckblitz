import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 20338.

export default defineCard({
  name: "Flashfreeze",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target red or green spell.",
  targets: [{ kind: "spell", filter: { anyOf: [{ colors: ["R"] }, { colors: ["G"] }] } }],
  effect: { kind: "counter", target: 0 },
});
