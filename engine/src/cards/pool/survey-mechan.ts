import { defineCard } from "../define.js";

const TEXT =
  "{10}, Sacrifice this creature: It deals 3 damage to any target. Target player draws three cards and gains 3 life. This ability costs {X} less to activate, where X is the number of differently named lands you control.";

export default defineCard({
  name: "Survey Mechan",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 1,
  toughness: 3,
  keywords: ["flying", "hexproof"],
  text: `Flying\nHexproof (This creature can't be the target of spells or abilities your opponents control.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{10}", tap: false, sacrifice: "self" },
      costReduction: {
        reduceGeneric: { aggregate: "distinct", of: "name", filter: { type: "land", controlledBy: "you" } },
      },
      targets: ["any-target", "player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 3, target: 0 },
          { kind: "draw", amount: 3, target: 1 },
          { kind: "gain-life", amount: 3, toControllerOfTarget: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
