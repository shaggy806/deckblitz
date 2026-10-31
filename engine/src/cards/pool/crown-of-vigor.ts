import { defineCard } from "../define.js";

const SACRIFICE_TEXT =
  "Sacrifice this Aura: Enchanted creature and other creatures that share a creature type with it get +1/+1 until end of turn.";

// "Enchanted creature and other creatures that share a creature type with
// it" is `sharesCreatureTypeWith: "attached"`: the creature this Aura was on
// as it was sacrificed (the host is in even with no creature type), read as
// the effect applies.
export default defineCard({
  name: "Crown of Vigor",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +1/+1.\n${SACRIFICE_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Enchanted creature gets +1/+1." }],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", sharesCreatureTypeWith: "attached" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: SACRIFICE_TEXT,
    },
  ],
});
