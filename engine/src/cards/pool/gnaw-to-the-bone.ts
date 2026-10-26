import { defineCard } from "../define.js";

// EDHREC rank 16514. Gerrard's Wisdom's "2 life for each", over Kraul
// Foragers' count of creature cards in your graveyard.

export default defineCard({
  name: "Gnaw to the Bone",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  flashback: { cost: "{2}{G}" },
  text: "You gain 2 life for each creature card in your graveyard.\nFlashback {2}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: {
    kind: "gain-life",
    amount: { product: [2, { countInGraveyard: { type: "creature", ownedBy: "you" } }] },
  },
});
