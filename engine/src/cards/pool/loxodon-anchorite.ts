import { defineCard } from "../define.js";

export default defineCard({
  name: "Loxodon Anchorite",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elephant", "Cleric"],
  power: 2,
  toughness: 3,
  text: "{T}: Prevent the next 2 damage that would be dealt to any target this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 2 },
      resolve: null,
      text: "{T}: Prevent the next 2 damage that would be dealt to any target this turn.",
    },
  ],
});
