import { defineCard } from "../define.js";

// EDHREC rank 21740. Torment.

export default defineCard({
  name: "Frantic Purification",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  madness: { cost: "{W}" },
  text: "Destroy target enchantment.\nMadness {W} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  targets: ["enchantment"],
  effect: { kind: "destroy", target: 0 },
});
