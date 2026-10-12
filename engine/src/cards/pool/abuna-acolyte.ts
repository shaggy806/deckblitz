import { defineCard } from "../define.js";

export default defineCard({
  name: "Abuna Acolyte",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Cleric"],
  power: 1,
  toughness: 1,
  text: "{T}: Prevent the next 1 damage that would be dealt to any target this turn.\n{T}: Prevent the next 2 damage that would be dealt to target artifact creature this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 1 },
      resolve: null,
      text: "{T}: Prevent the next 1 damage that would be dealt to any target this turn.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { types: ["artifact", "creature"] } }],
      effect: { kind: "prevent-damage", target: 0, amount: 2 },
      resolve: null,
      text: "{T}: Prevent the next 2 damage that would be dealt to target artifact creature this turn.",
    },
  ],
});
