import { defineCard } from "../define.js";

export default defineCard({
  name: "Give In to Violence",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets +2/+2 and gains lifelink until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
    ],
  },
});
