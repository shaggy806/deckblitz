import { defineCard } from "../define.js";

// EDHREC rank 19313. "Sacrifice it at the beginning of the next end step" is
// a real delayed triggered ability about the token just made (rule 603.7 —
// Urabrask's Forge's shape); you sacrifice it only while you control it.

export default defineCard({
  name: "Hungry for More",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  flashback: { cost: "{1}{B}{R}" },
  text: "Create a 3/1 black and red Vampire creature token with trample, lifelink, and haste. Sacrifice it at the beginning of the next end step.\nFlashback {1}{B}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Vampire Token (Hungry for More)", count: 1 },
      {
        kind: "delayed-trigger",
        at: "next-end-step",
        about: "created",
        effect: { kind: "sacrifice-target", target: 0 },
        text: "Sacrifice it at the beginning of the next end step.",
      },
    ],
  },
});
