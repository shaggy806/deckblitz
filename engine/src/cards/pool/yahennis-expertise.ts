import { defineCard } from "../define.js";

// EDHREC rank 8716.
//
// Sram's Expertise's shape. Creatures at 0 toughness are still on the
// battlefield while the free spell is cast (no state-based actions mid-
// resolution), as the rulings say.
//
// Rulings:
//   [2017-02-09] If the card has {X} in its mana cost, you must choose 0 as the value of X when
//     casting it without paying its mana cost.
//   [2017-02-09] If a creature's toughness is reduced to 0 or less by Yahenni's Expertise, that
//     creature is still on the battlefield as you cast your free spell. It can be the target of
//     that spell, although it will become an illegal target before that spell resolves.

export default defineCard({
  name: "Yahenni's Expertise",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "All creatures get -3/-3 until end of turn.\nYou may cast a spell with mana value 3 or less from your hand without paying its mana cost.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt-all", filter: { type: "creature" }, power: -3, toughness: -3, duration: "end-of-turn" },
      { kind: "cast-now", from: "hand", free: true, spell: { manaValue: { op: "lte", n: 3 } } },
    ],
  },
});
