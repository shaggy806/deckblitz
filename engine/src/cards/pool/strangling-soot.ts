import { defineCard } from "../define.js";

export default defineCard({
  name: "Strangling Soot",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  flashback: { cost: "{5}{R}" },
  text: "Destroy target creature with toughness 3 or less.\nFlashback {5}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [{ kind: "permanent", filter: { type: "creature", toughness: { op: "lte", n: 3 } } }],
  effect: { kind: "destroy", target: 0 },
});
