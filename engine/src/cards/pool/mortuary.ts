import { defineCard } from "../define.js";

// EDHREC rank 13108.
//
// Rulings:
//   [2004-10-04] This is not an optional ability.
//
// "A creature is put into your graveyard from the battlefield" is a creature
// you own dying, whoever controlled it (Angelic Renewal's trigger). The card
// is found in the graveyard it went to, and only there (rule 400.7).

const TEXT = "Whenever a creature is put into your graveyard from the battlefield, put that card on top of your library.";

export default defineCard({
  name: "Mortuary",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", ownedBy: "you" } },
      targets: [],
      effect: { kind: "put-on-library", target: "trigger-object", position: "top" },
      resolve: null,
      text: TEXT,
    },
  ],
});
