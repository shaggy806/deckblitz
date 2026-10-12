import { defineCard } from "../define.js";
import { START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 9639. A sacrifice is mandatory for anyone with a creature or
// Vehicle they can sacrifice, so "each opponent who can't" is each opponent
// who sacrificed nothing this way. The life is the speed as the ability
// resolves (0 with none, rule 702.179f); sacrificing the enchantment to pay
// for it doesn't lower it.
const ENTERS_TEXT =
  "When this enchantment enters, each opponent sacrifices a creature or Vehicle of their choice. Each opponent who can't discards a card.";
const LIFE_TEXT = "{2}, Sacrifice this enchantment: You gain life equal to your speed.";

export default defineCard({
  name: "Momentum Breaker",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  keywords: ["start-your-engines"],
  text: `${START_YOUR_ENGINES_TEXT}\n${ENTERS_TEXT}\n${LIFE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "sacrifice",
            who: "each-opponent",
            filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] },
            count: 1,
          },
          {
            kind: "for-each-player",
            who: "each-opponent",
            effect: {
              kind: "conditional",
              condition: { kind: "this-way", what: "sacrificed", who: "that-player", atMost: 0 },
              then: { kind: "discard", target: "that-player", amount: 1 },
            },
          },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { speed: "you" } },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
});
