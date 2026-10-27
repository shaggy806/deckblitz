import { defineCard } from "../define.js";

const TEXT = "{T}, Sacrifice this creature: It deals 3 damage to target attacking or blocking creature.";

export default defineCard({
  name: "Divebomber Griffin",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Griffin"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: ["attacking-or-blocking-creature"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
