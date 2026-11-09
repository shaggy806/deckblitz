import { defineCard } from "../define.js";

// EDHREC rank 14654.
export default defineCard({
  name: "Seize the Storm",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Create a red Elemental creature token with trample and \"This token's power and toughness are each equal to the number of instant and sorcery cards in your graveyard plus the number of cards with flashback you own in exile.\"\nFlashback {6}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: { kind: "create-token", token: "Red Elemental Token (Trample, Spells and Flashback Count)", count: 1 },
  flashback: { cost: "{6}{R}" },
});
