import { defineCard } from "../define.js";

export default defineCard({
  name: "Aim High",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Untap target creature. It gets +2/+2 and gains reach until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap", target: 0 },
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "reach", duration: "end-of-turn" },
    ],
  },
});
