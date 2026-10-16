import { defineCard } from "../define.js";

// EDHREC rank 16125.
//
// Spell Swindle's shape: X is the countered spell's mana value as it last was
// on the stack, its {X} included (the ruling).
export default defineCard({
  name: "Hurl into History",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target artifact or creature spell. Discover X, where X is that spell's mana value. (Exile cards from the top of your library until you exile a nonland card with that mana value or less. Cast it without paying its mana cost or put it into your hand. Put the rest on the bottom in a random order.)",
  targets: [{ kind: "spell", filter: { typesAnyOf: ["artifact", "creature"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "discover", amount: { manaValueOf: 0 } },
    ],
  },
});
