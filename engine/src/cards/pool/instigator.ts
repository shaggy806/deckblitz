import { defineCard } from "../define.js";

// EDHREC rank 29357.

export default defineCard({
  name: "Instigator",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: "{1}{B}{B}, {T}, Discard a card: Creatures target player controls attack this turn if able.",
  activated: [
    {
      cost: { mana: "{1}{B}{B}", tap: true, discard: { count: 1 } },
      targets: ["player"],
      effect: { kind: "restrict", filter: { controlledBy: "you", type: "creature" }, controlledByTarget: 0, restrictions: ["must-attack"], duration: "end-of-turn" },
      resolve: null,
      text: "{1}{B}{B}, {T}, Discard a card: Creatures target player controls attack this turn if able.",
    },
  ],
});
