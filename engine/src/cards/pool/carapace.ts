import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 19553.
//
// Rulings:
//   [2004-10-04] This leaves the battlefield when you activate its activated ability, but the
//     enchanted creature won't be regenerated until the ability resolves. In the intervening time,
//     the creature will no longer have the bonus that this had been giving it. This may cause the
//     creature to be destroyed before the regeneration shield is created.
// "Enchanted creature" is read off the Aura as it last existed (rule 608.2h) — Thrull Retainer's shape.

const PUMP = "Enchanted creature gets +0/+2.";
const REGEN = "Sacrifice this Aura: Regenerate enchanted creature.";

export default defineCard({
  name: "Carapace",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${PUMP}\n${REGEN}`,
  targets: ["creature"],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "regenerate", target: "attached" },
      resolve: null,
      text: REGEN,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [0, 2], text: PUMP }],
});
