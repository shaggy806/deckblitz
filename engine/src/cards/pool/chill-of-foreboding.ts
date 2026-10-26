import { defineCard } from "../define.js";

// EDHREC rank 20166.

export default defineCard({
  name: "Chill of Foreboding",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  flashback: { cost: "{7}{U}" },
  text: "Each player mills five cards.\nFlashback {7}{U} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: { kind: "mill", target: "each-player", amount: 5 },
});
