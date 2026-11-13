import { defineCard } from "../define.js";

// EDHREC rank 3272.
// Rulings:
//   [2023-02-04] Strong Back's third ability won't reduce its own cost.
//   [2023-02-04] Strong Back's abilities reduce only the amount of generic mana in equip abilities
//     that target the enchanted creature and in the total cost of Aura spells that target the
//     enchanted creature.
//   [2023-02-04] Reconfigure is not an equip ability, and reconfigure costs are not reduced by
//     Strong Back's second ability.
//
// "Enchanted creature" as each cost is totalled is the one Strong Back is
// attached to then (`hostOfSource`); the targets are fixed first (rule
// 601.2c), so only an equip ability or Aura spell aimed at it pays less.

const EQUIP_TEXT = "Equip abilities you activate that target enchanted creature cost {3} less to activate.";
const AURA_TEXT = "Aura spells you cast that target enchanted creature cost {3} less to cast.";
const PT_TEXT = "Enchanted creature gets +2/+2 for each Aura and Equipment attached to it.";

export default defineCard({
  name: "Strong Back",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  targets: ["creature"],
  text: `Enchant creature\n${EQUIP_TEXT}\n${AURA_TEXT}\n${PT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      abilityCostModification: {
        applies: {},
        abilityKind: "equip",
        byYou: true,
        targeting: { hostOfSource: true },
        reduceGeneric: 3,
      },
      text: EQUIP_TEXT,
    },
    {
      affects: { scope: "self" },
      costModification: {
        applies: { subtype: "Aura" },
        targeting: { hostOfSource: true },
        reduceGeneric: 3,
        when: { caster: "you" },
      },
      text: AURA_TEXT,
    },
    {
      affects: { scope: "attached" },
      grantPtPerCount: {
        filter: { subtypes: ["Aura", "Equipment"], attachedTo: { isSource: true } },
        relativeToAffected: true,
        pt: [2, 2],
      },
      text: PT_TEXT,
    },
  ],
});
