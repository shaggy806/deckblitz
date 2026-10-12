import { defineCard } from "../define.js";

export default defineCard({
  name: "Radiant's Judgment",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: "Destroy target creature with power 4 or greater.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
  effect: { kind: "destroy", target: 0 },
});
