import { defineCard } from "../define.js";

export default defineCard({
  name: "Mox Pearl",
  manaCost: "{0}",
  colors: [],
  types: ["artifact"],
  text: "{T}: Add {W}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "W", amount: 1 },
      resolve: null,
      text: "{T}: Add {W}.",
    },
  ],
});
