import { defineCard } from "../define.js";

// EDHREC rank 27929.

const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, Captain Burnham deals 1 damage to each opponent. If this is the second time this ability has resolved this turn, put a +1/+1 counter on Captain Burnham.";

export default defineCard({
  name: "Captain Michael Burnham",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${LANDFALL_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, who: "each-opponent" },
          {
            kind: "conditional",
            condition: { kind: "resolved-this-turn", n: 2 },
            then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
