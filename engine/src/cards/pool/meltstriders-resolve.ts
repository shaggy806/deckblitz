import { defineCard } from "../define.js";

// EDHREC rank 9899.
//
// Warbriar Blessing's shape: the enchanted creature fights the target.

const ENTERS =
  "When this Aura enters, enchanted creature fights up to one target creature an opponent controls. (Each deals damage equal to its power to the other.)";

export default defineCard({
  name: "Meltstrider's Resolve",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature you control\n${ENTERS}\nEnchanted creature gets +0/+2 and can't be blocked by more than one creature.`,
  targets: ["creature-you-control"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature-an-opponent-controls" }],
      effect: { kind: "fight", a: "attached", b: 0 },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [0, 2],
      blockedByAtMostOne: true,
      text: "Enchanted creature gets +0/+2 and can't be blocked by more than one creature.",
    },
  ],
});
