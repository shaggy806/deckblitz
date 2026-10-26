import { defineCard } from "../define.js";

// EDHREC rank 21285. Indestructible Aura's shape.

export default defineCard({
  name: "Shielded Passage",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent all damage that would be dealt to target creature this turn.",
  targets: ["creature"],
  effect: { kind: "prevent-damage", target: 0, amount: "all" },
});
