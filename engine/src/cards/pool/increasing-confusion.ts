import { defineCard } from "../define.js";

// Dark Ascension (DKA). EDHREC rank 9947.
//
// Rulings:
//   [2011-01-22] Regardless of which zone Increasing Confusion is cast from, it puts cards from
//     the top of target player's library into that player's graveyard.
//
// Plunder the Trollshaws' shape: "cast from a graveyard" is the spell's own
// `castFrom`, and twice X is X plus X.

export default defineCard({
  name: "Increasing Confusion",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["sorcery"],
  flashback: { cost: "{X}{U}" },
  text: "Target player mills X cards. If this spell was cast from a graveyard, that player mills twice that many cards instead.\nFlashback {X}{U} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["player"],
  effect: {
    kind: "mill",
    target: 0,
    amount: {
      ifCondition: { kind: "source", filter: { castFrom: "graveyard" } },
      then: { sum: ["x", "x"] },
      else: "x",
    },
  },
});
