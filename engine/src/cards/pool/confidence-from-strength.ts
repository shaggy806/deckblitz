import { defineCard } from "../define.js";

export default defineCard({
  name: "Confidence from Strength",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target creature gets +4/+4 and gains trample until end of turn. (It can deal excess combat damage to the player or planeswalker it's attacking.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 4, toughness: 4, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
    ],
  },
});
