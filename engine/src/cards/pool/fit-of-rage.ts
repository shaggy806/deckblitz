import { defineCard } from "../define.js";

export default defineCard({
  name: "Fit of Rage",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Target creature gets +3/+3 and gains first strike until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
    ],
  },
});
