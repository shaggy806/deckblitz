import { defineCard } from "../define.js";

// Limited Edition Alpha (LEA). EDHREC rank 13121.
//
// Eldrazi Monument's shape: the sacrifice is forced whenever another creature
// is there to give (the ruling — you can't take the 7 instead), and only when
// nothing was sacrificed does this creature deal 7 damage to you (so its own
// lifelink applies, per the ruling).
const UPKEEP =
  "At the beginning of your upkeep, sacrifice a creature other than this creature. If you can't, this creature deals 7 damage to you.";

export default defineCard({
  name: "Lord of the Pit",
  manaCost: "{4}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 7,
  toughness: 7,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${UPKEEP}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1, exceptSource: true },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed", atMost: 0 },
            then: { kind: "damage", amount: 7, who: "you" },
          },
        ],
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
