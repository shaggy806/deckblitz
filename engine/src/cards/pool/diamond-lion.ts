import { defineCard } from "../define.js";

const TEXT = "{T}, Discard your hand, Sacrifice this creature: Add three mana of any one color. Activate only as an instant.";

// Lion's Eye Diamond's shape, with {T}: a mana ability that can't be
// activated mid-payment (the ruling). Discarding the hand keeps it off the
// auto-payer, and an ability activated by hand is only offered to the player
// with priority — exactly when an instant could be cast.
export default defineCard({
  name: "Diamond Lion",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Cat"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, discardHand: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
});
