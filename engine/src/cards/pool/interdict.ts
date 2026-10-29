import { defineCard } from "../define.js";

// EDHREC rank 22695.
//
// Rulings:
//   [2004-10-04] This card targets the ability, and not the permanent itself.

export default defineCard({
  name: "Interdict",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target activated ability from an artifact, creature, enchantment, or land. That permanent's activated abilities can't be activated this turn. (Mana abilities can't be targeted.)\nDraw a card.",
  targets: [
    { kind: "ability", abilityKind: "activated", sourceTypes: ["artifact", "creature", "enchantment", "land"] },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0, lockSource: true },
      { kind: "draw", amount: 1 },
    ],
  },
});
