import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 16862. Demonic Vigor's shape, at +2/+2.

const DIES_TEXT = "When enchanted creature dies, return that card to its owner's hand.";

export default defineCard({
  name: "Squee's Embrace",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +2/+2.\n${DIES_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], text: "Enchanted creature gets +2/+2." }],
  triggered: [
    {
      // A token that died ceases to exist, so nothing returns.
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
