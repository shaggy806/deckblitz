import { defineCard } from "../define.js";

export default defineCard({
  name: "Uncaged Fury",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature gets +1/+1 and gains double strike until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
    ],
  },
});
