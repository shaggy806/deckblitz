import { defineCard } from "../define.js";

// Champions of Kamigawa.

export default defineCard({
  name: "Kitsune Healer",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Fox", "Cleric"],
  power: 2,
  toughness: 2,
  text: "{T}: Prevent the next 1 damage that would be dealt to any target this turn.\n{T}: Prevent all damage that would be dealt to target legendary creature this turn.",
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
      targets: [{ kind: "permanent", filter: { type: "creature", supertype: "legendary" } }],
      effect: { kind: "prevent-damage", target: 0, amount: "all" },
      resolve: null,
      text: "{T}: Prevent all damage that would be dealt to target legendary creature this turn.",
    },
  ],
});
