import { defineCard } from "../define.js";

// EDHREC rank 13116.

const DIES_TEXT = "When enchanted creature dies, return that card to its owner's hand.";

export default defineCard({
  name: "Demonic Vigor",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +1/+1.\n${DIES_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Enchanted creature gets +1/+1." }],
  triggered: [
    {
      // A token that died ceases to exist, so nothing returns (the ruling).
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
