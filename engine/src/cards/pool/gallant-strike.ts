import { defineCard } from "../define.js";

export default defineCard({
  name: "Gallant Strike",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: "Destroy target creature with toughness 4 or greater.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: [{ kind: "permanent", filter: { type: "creature", toughness: { op: "gte", n: 4 } } }],
  effect: { kind: "destroy", target: 0 },
});
