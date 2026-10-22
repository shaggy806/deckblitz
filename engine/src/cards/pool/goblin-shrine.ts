import { defineCard } from "../define.js";

// The Dark (DRK). EDHREC rank 22544.
//
// Rulings:
//   [2004-10-04] Works even if placed on one of your opponent's Mountains.
//
// "Goblin creatures" is every Goblin on the battlefield, whoever controls it,
// while the enchanted land is a basic Mountain (a `source` condition on what
// the Aura is attached to — Akki War Paint's shape). The leaves trigger's
// damage is dealt by the Aura as it last existed.

const BONUS = "As long as enchanted land is a basic Mountain, Goblin creatures get +1/+0.";
const LEAVES = "When this Aura leaves the battlefield, it deals 1 damage to each Goblin creature.";

export default defineCard({
  name: "Goblin Shrine",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${BONUS}\n${LEAVES}`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Goblin" } },
      condition: { kind: "source", filter: { attachedTo: { subtype: "Mountain", supertype: "basic" } } },
      grantPt: [1, 0],
      text: BONUS,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature", subtype: "Goblin" }, amount: 1 },
      resolve: null,
      text: LEAVES,
    },
  ],
});
