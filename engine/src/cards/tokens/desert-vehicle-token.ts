import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// The Bus Runner's token: no token printing in the Oracle snapshot.

const TAPPED_TEXT =
  "Whenever this token or a Gamer you control becomes tapped, remove an hour counter from this token. Then if it has no hour counters on it, each opponent loses 1 life, you gain 1 life, and put eight hour counters on this token.";

export default defineCard({
  name: "Desert Vehicle Token",
  tokenName: "Desert Vehicle",
  colors: [],
  types: ["artifact", "land"],
  subtypes: ["Desert", "Vehicle"],
  power: 4,
  toughness: 4,
  text: `Crew 2 (Tap any number of creatures you control with total power 2 or more: This token becomes an artifact creature until end of turn.)\n{T}: Add {C}.\n${TAPPED_TEXT}`,
  activated: [
    crew(2),
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
  ],
  triggered: [
    {
      trigger: {
        on: "becomes-tapped",
        who: "you-control",
        filter: { anyOf: [{ isSource: true }, { subtype: "Gamer" }] },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "remove-counter", target: "source", counter: "hour", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "hour", compare: { op: "eq", n: 0 } },
            then: {
              kind: "sequence",
              effects: [
                { kind: "lose-life", amount: 1, who: "each-opponent" },
                { kind: "gain-life", amount: 1 },
                { kind: "add-counter", target: "source", counter: "hour", amount: 8 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TAPPED_TEXT,
    },
  ],
});
