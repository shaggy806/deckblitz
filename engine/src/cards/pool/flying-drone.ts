import { defineCard } from "../define.js";

const LOOT =
  "{1}{U}, {T}: Draw a card, then discard a card. This ability costs {1}{U} less to activate if another creature with flying entered the battlefield under your control this turn.";

export default defineCard({
  name: "Flying Drone",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Scout"],
  power: 1,
  toughness: 2,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${LOOT}`,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: true },
      costReduction: {
        reduceGeneric: 1,
        reduceColored: "{U}",
        condition: {
          kind: "turn-history",
          what: "entered",
          filter: { type: "creature", keyword: "flying" },
          excludeSelf: true,
        },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: LOOT,
    },
  ],
});
