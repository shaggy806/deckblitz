import { defineCard } from "../define.js";

export default defineCard({
  name: "Amulet of Kroog",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "{2}, {T}: Prevent the next 1 damage that would be dealt to any target this turn.",
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 1 },
      resolve: null,
      text: "{2}, {T}: Prevent the next 1 damage that would be dealt to any target this turn.",
    },
  ],
});
