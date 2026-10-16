import { defineCard } from "../define.js";

// EDHREC rank 11532. The Lost Caverns of Ixalan.

export default defineCard({
  name: "Acrobatic Leap",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +1/+3 and gains flying until end of turn. Untap it.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 3, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      { kind: "untap", target: 0 },
    ],
  },
});
