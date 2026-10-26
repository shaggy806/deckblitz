import { defineCard } from "../define.js";

const TEXT = "{T}, Sacrifice this creature: It deals 2 damage to target attacking or blocking creature.";

export default defineCard({
  name: "Expendable Troops",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 1,
  text: TEXT,
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
