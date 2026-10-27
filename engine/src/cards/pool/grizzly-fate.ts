import { defineCard } from "../define.js";

// EDHREC rank 10791.
// Threshold is read as it resolves, with this spell on the stack and not in
// the graveyard (the ruling).

export default defineCard({
  name: "Grizzly Fate",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  flashback: { cost: "{5}{G}{G}" },
  text: "Create two 2/2 green Bear creature tokens.\nThreshold — Create four 2/2 green Bear creature tokens instead if there are seven or more cards in your graveyard.\nFlashback {5}{G}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "threshold" },
    then: { kind: "create-token", token: "Bear Token", count: 4 },
    else: { kind: "create-token", token: "Bear Token", count: 2 },
  },
});
