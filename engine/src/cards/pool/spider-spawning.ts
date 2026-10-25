import { defineCard } from "../define.js";

// EDHREC rank 7966.
//
// Rulings:
//   [2011-09-22] The number of creature cards in your graveyard is counted when Spider Spawning
//     resolves.
//   [2021-03-19] A spell cast using flashback will always be exiled afterward, whether it
//     resolves, is countered, or leaves the stack in some other way.

export default defineCard({
  name: "Spider Spawning",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  flashback: { cost: "{6}{B}" },
  text: "Create a 1/2 green Spider creature token with reach for each creature card in your graveyard.\nFlashback {6}{B} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  effect: {
    kind: "create-token",
    token: "1/2 Green Spider Token (Reach)",
    count: { countInGraveyard: { type: "creature", ownedBy: "you" } },
  },
});
