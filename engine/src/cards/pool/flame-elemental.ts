import { defineCard } from "../define.js";

export default defineCard({
  name: "Flame Elemental",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 2,
  text: "{R}, {T}, Sacrifice this creature: It deals damage equal to its power to target creature.",
  activated: [
    {
      cost: { mana: "{R}", tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: "{R}, {T}, Sacrifice this creature: It deals damage equal to its power to target creature.",
    },
  ],
});
