import { defineCard } from "../define.js";

// EDHREC rank 26282. Two statics on the enchanted creature: the +1/+1, and
// the delirium +2/+2 on top of it.
const DELIRIUM =
  "Delirium — Enchanted creature gets an additional +2/+2 as long as there are four or more card types among cards in your graveyard.";

export default defineCard({
  name: "Strange Augmentation",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +1/+1.\n${DELIRIUM}`,
  targets: ["creature"],
  static: [
    { affects: { scope: "attached" }, grantPt: [1, 1], text: "Enchanted creature gets +1/+1." },
    { affects: { scope: "attached" }, condition: { kind: "delirium" }, grantPt: [2, 2], text: DELIRIUM },
  ],
});
