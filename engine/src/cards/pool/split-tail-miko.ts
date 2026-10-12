import { defineCard } from "../define.js";

export default defineCard({
  name: "Split-Tail Miko",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Fox", "Cleric"],
  power: 1,
  toughness: 1,
  text: "{W}, {T}: Prevent the next 2 damage that would be dealt to any target this turn.",
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 2 },
      resolve: null,
      text: "{W}, {T}: Prevent the next 2 damage that would be dealt to any target this turn.",
    },
  ],
});
