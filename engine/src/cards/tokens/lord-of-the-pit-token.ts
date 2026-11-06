import { defineCard } from "../define.js";

/** The Lord of the Pit token (Thomil, the Destroyer): a copy of the card Lord
 * of the Pit — named Lord of the Pit, its {4}{B}{B}{B} mana cost and all. */
const UPKEEP =
  "At the beginning of your upkeep, sacrifice another creature. If you can't, this token deals 7 damage to you.";

export default defineCard({
  name: "Lord of the Pit Token",
  tokenName: "Lord of the Pit",
  art: "5b626ab2-4cf6-42e8-a7e2-9c9f310d2f00",
  manaCost: "{4}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 7,
  toughness: 7,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${UPKEEP}\n(This token's mana cost is {4}{B}{B}{B}.)`,
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
