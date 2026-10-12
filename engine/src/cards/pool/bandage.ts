import { defineCard } from "../define.js";

export default defineCard({
  name: "Bandage",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent the next 1 damage that would be dealt to any target this turn.\nDraw a card.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "prevent-damage", target: 0, amount: 1 }, { kind: "draw", amount: 1 }],
  },
});
