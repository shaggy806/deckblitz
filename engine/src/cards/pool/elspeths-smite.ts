import { defineCard } from "../define.js";

export default defineCard({
  name: "Elspeth's Smite",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Elspeth's Smite deals 3 damage to target attacking or blocking creature. If that creature would die this turn, exile it instead.",
  targets: ["attacking-or-blocking-creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 3, target: 0 }, { kind: "exile-if-dies-this-turn", target: 0 }],
  },
});
