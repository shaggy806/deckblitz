import { defineCard } from "../define.js";

// EDHREC rank 22930.
//
// Rulings:
//   [2004-10-04] Does not target the creatures.
//   [2004-10-04] The creatures are chosen on resolution, not on announcement.
//
// "Put into your graveyard from the battlefield": creatures you own that
// died this turn, whoever controlled them (tokens included).

export default defineCard({
  name: "Urborg Justice",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target opponent sacrifices a creature of their choice for each creature put into your graveyard from the battlefield this turn.",
  targets: ["opponent"],
  effect: {
    kind: "sacrifice",
    who: "target",
    filter: { type: "creature" },
    count: { turnHistory: "died", who: "each-player", filter: { type: "creature", ownedBy: "you" } },
  },
});
