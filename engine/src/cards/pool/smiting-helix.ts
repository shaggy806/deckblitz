import { defineCard } from "../define.js";

export default defineCard({
  name: "Smiting Helix",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  flashback: { cost: "{R}{W}" },
  text: "Smiting Helix deals 3 damage to any target and you gain 3 life.\nFlashback {R}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 3, target: 0 }, { kind: "gain-life", amount: 3 }],
  },
});
