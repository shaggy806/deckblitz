import { defineCard } from "../define.js";

// EDHREC rank 7460.
//
// X is the total mana value of the noncreature enchantments you control as
// it's cast ({X} in their costs as 0). "Another enchantment": not itself.
const SAC_TEXT = "{1}{G}, Sacrifice another enchantment: This creature gains indestructible until end of turn.";

export default defineCard({
  name: "Nyxborn Behemoth",
  manaCost: "{10}{G}{G}",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Beast"],
  power: 10,
  toughness: 10,
  keywords: ["trample"],
  text: `This spell costs {X} less to cast, where X is the total mana value of noncreature enchantments you control.\nTrample\n${SAC_TEXT}`,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: {
      aggregate: "sum",
      of: "mana-value",
      filter: { type: "enchantment", notTypes: ["creature"], controlledBy: "you" },
    },
  },
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false, sacrifice: { filter: { type: "enchantment" } } },
      otherOnly: true,
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
