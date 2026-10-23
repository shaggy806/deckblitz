import { defineCard } from "../define.js";

export default defineCard({
  name: "Bleed Dry",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets -13/-13 until end of turn. If that creature would die this turn, exile it instead.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: -13, toughness: -13, duration: "end-of-turn" },
      { kind: "exile-if-dies-this-turn", target: 0 },
    ],
  },
});
