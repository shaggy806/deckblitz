import { defineCard } from "../define.js";

// EDHREC rank 24655.

export default defineCard({
  name: "Blessed Wind",
  manaCost: "{7}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Target player's life total becomes 20.",
  targets: ["player"],
  effect: { kind: "set-life-total", who: 0, amount: 20 },
});
