import { defineCard } from "../define.js";

export default defineCard({
  name: "Mox Ruby",
  manaCost: "{0}",
  colors: [],
  types: ["artifact"],
  text: "{T}: Add {R}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: "{T}: Add {R}.",
    },
  ],
});
