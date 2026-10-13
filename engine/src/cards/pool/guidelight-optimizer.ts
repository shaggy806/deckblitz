import { defineCard } from "../define.js";

// EDHREC rank 10978.
//
// Rulings:
//   [2025-02-07] You may use mana from this creature to pay the cost of any activated ability, not
//     just abilities of artifacts.
//
// Steelswarm Operator's artifact-spell restriction plus Omen Hawker's "or
// activate an ability" — an `abilityOf` over any source in any zone (the
// ruling), the two halves joined by "or" as Woodland Weavemaster's are.

const MANA_TEXT = "{T}: Add {U}. Spend this mana only to cast an artifact spell or activate an ability.";

export default defineCard({
  name: "Guidelight Optimizer",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 2,
  toughness: 1,
  text: MANA_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "U",
        amount: 1,
        spendOnly: {
          spell: { type: "artifact" },
          abilityOf: {},
          abilityOfAnyZone: true,
          text: "Spend this mana only to cast an artifact spell or activate an ability.",
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
