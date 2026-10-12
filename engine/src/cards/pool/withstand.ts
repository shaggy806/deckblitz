import { defineCard } from "../define.js";

export default defineCard({
  name: "Withstand",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent the next 3 damage that would be dealt to any target this turn.\nDraw a card.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "prevent-damage", target: 0, amount: 3 }, { kind: "draw", amount: 1 }],
  },
});
