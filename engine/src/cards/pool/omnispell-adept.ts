import { defineCard } from "../define.js";

// EDHREC rank 19286.
//
// Rulings:
//   An {X} spell cast this way has X = 0; no alternative costs, though
//   additional costs may (or must) be paid. A sorcery may be cast this way even
//   if it's not your turn.
//
// Yue, the Moon Spirit's free cast from the hand as the ability resolves
// (rule 608.2g), of an instant or sorcery spell.

export default defineCard({
  name: "Omnispell Adept",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 4,
  text: "{2}{U}, {T}: You may cast an instant or sorcery spell from your hand without paying its mana cost.",
  activated: [
    {
      cost: { mana: "{2}{U}", tap: true },
      targets: [],
      effect: { kind: "cast-now", from: "hand", free: true, spell: { typesAnyOf: ["instant", "sorcery"] } },
      resolve: null,
      text: "{2}{U}, {T}: You may cast an instant or sorcery spell from your hand without paying its mana cost.",
    },
  ],
});
