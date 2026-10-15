import { defineCard } from "../define.js";

// EDHREC rank 19015.
//
// Interjection's pump and first strike, then "untap it" — the same target.

export default defineCard({
  name: "Riverguard's Reflexes",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +2/+2 and gains first strike until end of turn. Untap it.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
      { kind: "untap", target: 0 },
    ],
  },
});
