import { defineCard } from "../define.js";

// EDHREC rank 22308.
//
// Rulings:
//   It can target any creature, one that already flies or is untapped
//     included.

export default defineCard({
  name: "Vault Skyward",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target creature gains flying until end of turn. Untap it.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      { kind: "untap", target: 0 },
    ],
  },
});
