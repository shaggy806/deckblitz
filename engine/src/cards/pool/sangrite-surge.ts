import { defineCard } from "../define.js";

export default defineCard({
  name: "Sangrite Surge",
  manaCost: "{4}{R}{G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  text: "Target creature gets +3/+3 and gains double strike until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
    ],
  },
});
