import { defineCard } from "../define.js";

// One comparison over every creature on the battlefield, read as it's cast and
// again as it resolves (rule 608.2b): a target that's no longer the greatest
// is no longer legal.
export default defineCard({
  name: "Topple",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Exile target creature with the greatest power among creatures on the battlefield. (If two or more creatures are tied for greatest power, target any one of them.)",
  targets: [
    {
      kind: "permanent",
      whose: "any",
      filter: { type: "creature", greatestInZone: { of: "power", among: { type: "creature" } } },
    },
  ],
  effect: { kind: "exile", target: 0 },
});
