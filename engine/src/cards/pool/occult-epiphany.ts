import { defineCard } from "../define.js";

// EDHREC rank 8450.
//
// Rulings:
//   [2021-11-19] The card types that you can discard include artifact, creature, enchantment,
//     land, planeswalker, instant, and sorcery. Legendary, basic, and snow are supertypes, not card
//     types. Human, Equipment, and Aura are subtypes, not card types.
//
// The token count is Kefka, Court Mage's "for each card type among cards
// discarded this way" (`cardTypes`, card types only — rule 205.2a).
const TEXT =
  "Draw X cards, then discard X cards. Create a 1/1 white Spirit creature token with flying for each card type among cards discarded this way.";

export default defineCard({
  name: "Occult Epiphany",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: "x" },
      { kind: "discard", target: "you", amount: "x" },
      { kind: "create-token", token: "Spirit Token", count: { thisWay: "discarded", cardTypes: true } },
    ],
  },
});
