import { defineCard } from "../define.js";

// EDHREC rank 21948. Fallen Empires.
//
// Rulings:
//   [2008-04-01] This leaves the battlefield when you activate its activated ability, but the
//     enchanted creature won't be regenerated until the ability resolves. In the intervening
//     time, the creature will no longer have the bonus that this had been giving it.
// "Enchanted creature" is read off the Aura as it last existed (rule 608.2h).

const PUMP = "Enchanted creature gets +1/+1.";
const REGEN = "Sacrifice this Aura: Regenerate enchanted creature.";

export default defineCard({
  name: "Thrull Retainer",
  manaCost: "{B}",
  colors: ["B"],
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
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: PUMP }],
});
