import { defineCard } from "../define.js";

const SACRIFICE_TEXT =
  "Sacrifice this Aura: Enchanted creature and other creatures that share a creature type with it get +1/+0 and gain first strike until end of turn.";
const SHARERS = { type: "creature", sharesCreatureTypeWith: "attached" } as const;

export default defineCard({
  name: "Crown of Fury",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +1/+0 and has first strike.\n${SACRIFICE_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 0],
      grantKeywords: ["first-strike"],
      text: "Enchanted creature gets +1/+0 and has first strike.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: SHARERS, power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: SHARERS, keyword: "first-strike", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: SACRIFICE_TEXT,
    },
  ],
});
