import { defineCard } from "../define.js";

// EDHREC rank 2187.
//
// The power is the creature spell's on the stack; X its mana value as it was
// cast, {X} included, read as it last was there if it has left (Dancing from
// Dark to Dawn's `manaValueOf: "trigger-object"`).
const TEXT =
  "Whenever you cast a creature spell with power 5 or greater, discover X, where X is that spell's mana value. (Exile cards from the top of your library until you exile a nonland card with that mana value or less. Cast it without paying its mana cost or put it into your hand. Put the rest on the bottom in a random order.)";

export default defineCard({
  name: "Monstrous Vortex",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature", power: { op: "gte", n: 5 } } },
      targets: [],
      effect: { kind: "discover", amount: { manaValueOf: "trigger-object" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
