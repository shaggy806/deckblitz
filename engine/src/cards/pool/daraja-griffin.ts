import { defineCard } from "../define.js";

export default defineCard({
  name: "Daraja Griffin",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Griffin"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nSacrifice this creature: Destroy target black creature.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { colors: ["B"], type: "creature" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "Sacrifice this creature: Destroy target black creature.",
    },
  ],
});
