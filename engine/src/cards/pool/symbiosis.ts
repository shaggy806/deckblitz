import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 30487.

export default defineCard({
  name: "Symbiosis",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Two target creatures each get +2/+2 until end of turn.",
  targets: ["creature", { kind: "other", of: "creature", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 2, toughness: 2, duration: "end-of-turn" },
    ],
  },
});
