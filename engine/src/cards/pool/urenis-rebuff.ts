import { defineCard } from "../define.js";

// EDHREC rank 17306.

const HARMONIZE_TEXT =
  "Harmonize {5}{U} (You may cast this card from your graveyard for its harmonize cost. You may tap a creature you control to reduce that cost by {X}, where X is its power. Then exile this spell.)";

export default defineCard({
  name: "Ureni's Rebuff",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: `Return target creature to its owner's hand.\n${HARMONIZE_TEXT}`,
  targets: ["creature"],
  effect: { kind: "return-to-hand", target: 0 },
  harmonize: { cost: "{5}{U}" },
});
