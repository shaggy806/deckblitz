import { defineCard } from "../define.js";

export default defineCard({
  name: "Aura Extraction",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: "Put target enchantment on top of its owner's library.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: ["enchantment"],
  effect: { kind: "put-on-library", target: 0, position: "top" },
});
