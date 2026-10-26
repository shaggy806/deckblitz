import { defineCard } from "../define.js";

// Dissension.
const TEXT = "Hellbent — {T}, Sacrifice a creature or land: Draw a card. Activate only if you have no cards in hand.";

export default defineCard({
  name: "Ragamuffyn",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Cleric"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { typesAnyOf: ["creature", "land"] } } },
      condition: { kind: "hand-size", atMost: 0 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
