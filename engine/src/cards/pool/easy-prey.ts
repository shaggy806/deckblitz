import { defineCard } from "../define.js";

export default defineCard({
  name: "Easy Prey",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: "Destroy target creature with mana value 2 or less.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: [{ kind: "permanent", filter: { type: "creature", manaValue: { op: "lte", n: 2 } } }],
  effect: { kind: "destroy", target: 0 },
});
