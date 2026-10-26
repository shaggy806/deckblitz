import { defineCard } from "../define.js";

const TEXT = "Sacrifice this creature: It deals 4 damage to target creature. Activate only as a sorcery.";

export default defineCard({
  name: "Bloodpyre Elemental",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "damage", target: 0, amount: 4 },
      resolve: null,
      text: TEXT,
      sorcerySpeed: true,
    },
  ],
});
