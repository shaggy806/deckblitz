import { defineCard } from "../define.js";

export default defineCard({
  name: "Shape the Sands",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +0/+5 and gains reach until end of turn. (It can block creatures with flying.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 0, toughness: 5, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "reach", duration: "end-of-turn" },
    ],
  },
});
