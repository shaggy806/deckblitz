import { defineCard } from "../define.js";

// Magic Origins. EDHREC rank 16368.
//
// Rulings:
//   [2015-06-22] Targeting your own instant or sorcery with one such card in your graveyard: if
//     you decline to pay, it's countered into your graveyard and spell mastery then applies.
//   [2015-06-22] If spell mastery applies, you scry 2 even if the controller pays {3}.
//   [2015-06-22] Spell mastery is checked as the spell resolves.
//
// The counter comes first and the spell mastery check after it, both as this
// resolves — so a spell countered into your graveyard counts (the first
// ruling), and paying doesn't stop the scry.
export default defineCard({
  name: "Calculated Dismissal",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell unless its controller pays {3}.\nSpell mastery — If there are two or more instant and/or sorcery cards in your graveyard, scry 2. (To scry 2, look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "unless", chooser: 0, options: [{ pay: "{3}", text: "Pay {3}" }], otherwise: { kind: "counter", target: 0 } },
      {
        kind: "conditional",
        condition: { kind: "cards-in-graveyard", atLeast: 2, filter: { typesAnyOf: ["instant", "sorcery"] } },
        then: { kind: "scry", amount: 2 },
      },
    ],
  },
});
