import { defineCard } from "../define.js";

// EDHREC rank 9993. Broken Wings' target, with cycling.
export default defineCard({
  name: "Airship Crash",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: "Destroy target artifact, enchantment, or creature with flying.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: [
    {
      kind: "permanent",
      filter: { anyOf: [{ type: "artifact" }, { type: "enchantment" }, { type: "creature", keyword: "flying" }] },
    },
  ],
  effect: { kind: "destroy", target: 0 },
});
