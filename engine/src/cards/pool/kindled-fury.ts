import { defineCard } from "../define.js";

export default defineCard({
  name: "Kindled Fury",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature gets +1/+0 and gains first strike until end of turn. (It deals combat damage before creatures without first strike.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
    ],
  },
});
