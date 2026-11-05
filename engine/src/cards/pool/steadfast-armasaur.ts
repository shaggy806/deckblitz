import { defineCard } from "../define.js";

export default defineCard({
  name: "Steadfast Armasaur",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  text: "Vigilance\n{1}{W}, {T}: This creature deals damage equal to its toughness to target creature blocking or blocked by it.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", blockingRelation: { relation: "either" } } }],
      effect: { kind: "damage", amount: { toughnessOf: "source" }, target: 0 },
      resolve: null,
      text: "{1}{W}, {T}: This creature deals damage equal to its toughness to target creature blocking or blocked by it.",
    },
  ],
});
