import { defineCard } from "../define.js";

// EDHREC rank 25395.

const TEXT = "Sacrifice this creature: It deals 1 damage to target attacking or blocking creature.";

export default defineCard({
  name: "Duergar Assailant",
  manaCost: "{R/W}",
  colors: ["R", "W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Soldier"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["attacking-or-blocking-creature"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
