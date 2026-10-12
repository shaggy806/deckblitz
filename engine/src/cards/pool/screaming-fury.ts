import { defineCard } from "../define.js";

export default defineCard({
  name: "Screaming Fury",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Target creature gets +5/+0 and gains haste until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 5, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
