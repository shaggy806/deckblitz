import { defineCard } from "../define.js";

const ENTERS = "When this Aura enters, it deals 1 damage to enchanted creature.";
const STATIC = "Enchanted creature gets +3/+0 and has trample.";

// The damage goes to what the Aura enchants as the trigger resolves — not a
// target, so hexproof doesn't stop it. With +3/+0 applied the 1 damage still
// kills an X/1 (it gets no toughness), as the card intends.
export default defineCard({
  name: "Tilonalli's Crown",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTERS}\n${STATIC}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 0],
      grantKeywords: ["trample"],
      text: STATIC,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: 1, target: "attached" },
      resolve: null,
      text: ENTERS,
    },
  ],
});
