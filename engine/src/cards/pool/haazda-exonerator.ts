import { defineCard } from "../define.js";

// Dissension.
export default defineCard({
  name: "Haazda Exonerator",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: "{T}, Sacrifice this creature: Destroy target Aura.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { subtype: "Aura" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{T}, Sacrifice this creature: Destroy target Aura.",
    },
  ],
});
