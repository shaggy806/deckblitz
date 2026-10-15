import { defineCard } from "../define.js";

// EDHREC rank 13098. Increasing Devotion's "if this spell was cast from a
// graveyard" count.
// Rulings:
//   [2025-06-06] The value of X is calculated only once, as The Final Days resolves.
//   [2025-06-06] A spell cast using flashback will always be exiled afterward, whether it
//     resolves, is countered, or leaves the stack in some other way.

export default defineCard({
  name: "The Final Days",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  flashback: { cost: "{4}{B}{B}" },
  text: "Create two tapped 2/2 black Horror creature tokens. If this spell was cast from a graveyard, instead create X of those tokens, where X is the number of creature cards in your graveyard.\nFlashback {4}{B}{B} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  effect: {
    kind: "create-token",
    token: "Horror Token (The Final Days)",
    count: {
      ifCondition: { kind: "source", filter: { castFrom: "graveyard" } },
      then: { countInGraveyard: { type: "creature", ownedBy: "you" } },
      else: 2,
    },
    tapped: true,
  },
});
