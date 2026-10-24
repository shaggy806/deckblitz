import { defineCard } from "../define.js";

const ABILITY_TEXT = "{2}, {T}, Sacrifice this artifact: It deals 2 damage to target creature.";

export default defineCard({
  name: "Vial of Dragonfire",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: ABILITY_TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "damage", target: 0, amount: 2 },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
