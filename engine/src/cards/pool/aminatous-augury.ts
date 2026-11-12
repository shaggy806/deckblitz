import { defineCard } from "../define.js";

// EDHREC rank 2497. Impulse exile of eight, the grant until end of turn, free, `perType` over every
// nonland card type: one permission group whose types are spent one cast at a time, a multi-typed
// card as whichever type its caster names. The land goes onto the battlefield as the spell
// resolves (a `look-and-choose` among the exiled cards) — the permission never lets a land be
// played. Kindred is a card type too (rule 308).
//
// Rulings:
//   Casting an exiled card causes it to leave exile. You can't cast it multiple times.
//   If a nonland card has multiple types, such as an artifact creature, you may cast it as either
//     of those types.
//   If you exile a land with another card type, you can't play it later in the turn.
//   You must follow the normal timing permissions and restrictions of each spell you cast.
//   If a spell has {X} in its mana cost, you must choose 0 as the value of X.

export default defineCard({
  name: "Aminatou's Augury",
  manaCost: "{6}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Exile the top eight cards of your library. You may put a land card from among them onto the battlefield. Until end of turn, for each nonland card type, you may cast a spell of that type from among the exiled cards without paying its mana cost.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "impulse-exile",
        amount: 8,
        duration: "end-of-turn",
        free: true,
        perType: ["artifact", "battle", "creature", "enchantment", "instant", "kindred", "planeswalker", "sorcery"],
      },
      {
        kind: "look-and-choose",
        zone: "exiled-this-way",
        min: 0,
        max: 1,
        filter: { type: "land" },
        destination: "battlefield",
        leftover: "stay",
      },
    ],
  },
});
