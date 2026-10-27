import { defineCard } from "../define.js";

// Onslaught. EDHREC rank 31207. Expendable Troops' ability on a flier.

const TEXT = "{T}, Sacrifice this creature: It deals 2 damage to target attacking or blocking creature.";

export default defineCard({
  name: "Dive Bomber",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: ["attacking-or-blocking-creature"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
