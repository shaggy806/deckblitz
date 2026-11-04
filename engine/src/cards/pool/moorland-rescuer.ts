import { defineCard } from "../define.js";

// X is the power it last had on the battlefield, not its power in the graveyard
// (the ruling; rule 608.2h). Exiled in response, the cards still come back (the
// ruling), and "this card" is then gone from where the exile looks for it.
const TEXT =
  "When this creature dies, return any number of other creature cards with total power X or less from your " +
  "graveyard to the battlefield, where X is this creature's power. Exile this card.";

export default defineCard({
  name: "Moorland Rescuer",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "graveyard",
            filter: { type: "creature", isSource: false },
            min: 0,
            max: 99,
            together: { totalPowerAtMost: { powerOf: "source" } },
            destination: "battlefield",
            leftover: "stay",
          },
          { kind: "exile", target: "trigger-object" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
