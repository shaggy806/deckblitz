import { defineCard } from "../define.js";

// EDHREC rank 19468.
export default defineCard({
  name: "Vines of the Recluse",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +1/+2 and gains reach until end of turn. Untap it. (A creature with reach can block creatures with flying.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "reach", duration: "end-of-turn" },
      { kind: "untap", target: 0 },
    ],
  },
});
