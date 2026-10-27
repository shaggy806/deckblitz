import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 31675.

const TEXT = "{1}{W}, Sacrifice this creature: It deals 3 damage to target attacking or blocking creature.";

export default defineCard({
  name: "Soldier Replica",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Soldier"],
  power: 1,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false, sacrifice: "self" },
      targets: ["attacking-or-blocking-creature"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
