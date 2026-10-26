import { defineCard } from "../define.js";
import { champion } from "../helpers.js";

// Morningtide. Champion (rule 702.72): the `champion` helper, over either type.

export default defineCard({
  name: "Lightning Crafter",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 3,
  toughness: 3,
  text: "Champion a Goblin or Shaman (When this enters, sacrifice it unless you exile another Goblin or Shaman you control. When this leaves the battlefield, that card returns to the battlefield.)\n{T}: This creature deals 3 damage to any target.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: "{T}: This creature deals 3 damage to any target.",
    },
  ],
  triggered: champion({ subtypes: ["Goblin", "Shaman"] }, "a Goblin or Shaman"),
});
