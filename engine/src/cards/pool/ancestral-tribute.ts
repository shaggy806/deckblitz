import { defineCard } from "../define.js";

// EDHREC rank 25369.
//
// Rulings:
//   [2021-03-19] A spell cast using flashback will always be exiled afterward, whether it
//     resolves, is countered, or leaves the stack in some other way.

export default defineCard({
  name: "Ancestral Tribute",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  flashback: { cost: "{9}{W}{W}{W}" },
  text:
    "You gain 2 life for each card in your graveyard.\n" +
    "Flashback {9}{W}{W}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: { kind: "gain-life", amount: { product: [2, { graveyardSize: "you" }] } },
});
