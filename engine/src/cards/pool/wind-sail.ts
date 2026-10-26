import { defineCard } from "../define.js";

// EDHREC rank 31485.

export default defineCard({
  name: "Wind Sail",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "One or two target creatures gain flying until end of turn.",
  targets: ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 1, keyword: "flying", duration: "end-of-turn" },
    ],
  },
});
