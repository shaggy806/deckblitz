import { defineCard } from "../define.js";

export default defineCard({
  name: "Ob Nixilis's Cruelty",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets -5/-5 until end of turn. If that creature would die this turn, exile it instead.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: -5, toughness: -5, duration: "end-of-turn" },
      { kind: "exile-if-dies-this-turn", target: 0 },
    ],
  },
});
