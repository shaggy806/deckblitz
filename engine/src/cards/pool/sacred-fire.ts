import { defineCard } from "../define.js";

export default defineCard({
  name: "Sacred Fire",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["instant"],
  flashback: { cost: "{4}{R}{W}" },
  text: "Sacred Fire deals 2 damage to any target and you gain 2 life.\nFlashback {4}{R}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 2, target: 0 }, { kind: "gain-life", amount: 2 }],
  },
});
