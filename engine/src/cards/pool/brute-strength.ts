import { defineCard } from "../define.js";

export default defineCard({
  name: "Brute Strength",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature gets +3/+1 and gains trample until end of turn. (It can deal excess combat damage to the player or planeswalker it's attacking.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 1, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
    ],
  },
});
