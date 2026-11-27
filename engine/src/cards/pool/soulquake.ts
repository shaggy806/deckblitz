import { defineCard } from "../define.js";

// Mercadian Masques. EDHREC rank 27833.
//
// Every creature on the battlefield and every creature card in every
// graveyard, each to its owner's hand, in one instruction
// (`return-to-hand-all`'s `alsoGraveyards`, rule 608.2c).

const TEXT =
  "Return all creatures on the battlefield and all creature cards in graveyards to their owners' hands.";

export default defineCard({
  name: "Soulquake",
  manaCost: "{3}{U}{U}{B}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: TEXT,
  effect: { kind: "return-to-hand-all", filter: { type: "creature" }, alsoGraveyards: true },
});
