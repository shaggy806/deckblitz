import { defineCard } from "../define.js";

// EDHREC rank 14752.
//
// Mouser Foundry's shape: "it" deals the damage as it last existed, sacrificed.
const DAMAGE_TEXT = "{3}{R}, Sacrifice this creature: It deals 4 damage to target creature.";

export default defineCard({
  name: "Sarpadian Simulacrum",
  manaCost: "{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Goblin"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${DAMAGE_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{R}", tap: false, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "damage", target: 0, amount: 4 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
