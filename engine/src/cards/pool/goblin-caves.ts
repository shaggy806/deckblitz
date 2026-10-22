import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] Works if enchanting a Snow-Covered Mountain.
//   [2004-10-04] Works even if placed on one of your opponent's Mountains.

const TEXT = "As long as enchanted land is a basic Mountain, Goblin creatures get +0/+2.";

export default defineCard({
  name: "Goblin Caves",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${TEXT}`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Goblin" } },
      condition: { kind: "source", filter: { attachedTo: { subtype: "Mountain", supertype: "basic" } } },
      grantPt: [0, 2],
      text: TEXT,
    },
  ],
});
