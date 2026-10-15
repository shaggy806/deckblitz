import { defineCard } from "../define.js";

// EDHREC rank 7581.
//
// Prismari Charm's "surveil, then draw", with flashback.
export default defineCard({
  name: "Dreams of Laguna",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  flashback: { cost: "{3}{U}" },
  text: "Surveil 1, then draw a card. (To surveil 1, look at the top card of your library. You may put it into your graveyard.)\nFlashback {3}{U} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: { kind: "surveil", amount: 1, then: { kind: "draw", amount: 1 } },
});
