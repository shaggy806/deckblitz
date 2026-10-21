import { defineCard } from "../define.js";

// The enchanted creature (`"attached"` — the one it last enchanted if the
// Aura has left) fights up to one target; with that creature gone, the target
// deals and is dealt no damage (its rulings).
const ENTERS =
  "When this Aura enters, enchanted creature fights up to one target creature you don't control.";

export default defineCard({
  name: "Warbriar Blessing",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature you control\n${ENTERS} (Each deals damage equal to its power to the other.)\nEnchanted creature gets +0/+2.`,
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
  static: [{ affects: { scope: "attached" }, grantPt: [0, 2], text: "Enchanted creature gets +0/+2." }],
});
