import { defineCard } from "../define.js";

export default defineCard({
  name: "Uncanny Speed",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature gets +3/+0 and gains haste until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
