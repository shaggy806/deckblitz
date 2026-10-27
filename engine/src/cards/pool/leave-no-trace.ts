import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). Radiance: only the first enchantment is
// targeted; the others sharing a color with it as the spell resolves
// (`CardFilter.sharesColorWithTarget`) go in the same event, protection or
// hexproof notwithstanding. A colorless target goes alone.

export default defineCard({
  name: "Leave No Trace",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Radiance — Destroy target enchantment and each other enchantment that shares a color with it.",
  targets: ["enchantment"],
  effect: { kind: "destroy-all", filter: { type: "enchantment", sharesColorWithTarget: 0 } },
});
