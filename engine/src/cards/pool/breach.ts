import { defineCard } from "../define.js";

export default defineCard({
  name: "Breach",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets +2/+0 and gains fear until end of turn. (It can't be blocked except by artifact creatures and/or black creatures.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "fear", duration: "end-of-turn" },
    ],
  },
});
