import { defineCard } from "../define.js";

export default defineCard({
  name: "Angelic Blessing",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Target creature gets +3/+3 and gains flying until end of turn. (It can't be blocked except by creatures with flying or reach.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
    ],
  },
});
