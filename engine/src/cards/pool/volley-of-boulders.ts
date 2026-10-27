import { defineCard } from "../define.js";

// Odyssey. EDHREC rank 27586. Boulderfall's divided damage, with flashback.

export default defineCard({
  name: "Volley of Boulders",
  manaCost: "{8}{R}",
  colors: ["R"],
  types: ["sorcery"],
  flashback: { cost: "{R}{R}{R}{R}{R}{R}" },
  text: "Volley of Boulders deals 6 damage divided as you choose among any number of targets.\nFlashback {R}{R}{R}{R}{R}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [{ kind: "any-number", of: "any-target", max: 6 }],
  divided: { total: 6, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
});
