import { defineCard } from "../define.js";

export default defineCard({
  name: "Wake the Dragon",
  manaCost: "{4}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  flashback: { cost: "{6}{B}{R}" },
  text: "Create a 6/6 black and red Dragon creature token with flying, menace, and \"Whenever this token deals combat damage to a player, gain control of target artifact that player controls.\"\nFlashback {6}{B}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: { kind: "create-token", token: "Dragon Token (Wake the Dragon)", count: 1 },
});
