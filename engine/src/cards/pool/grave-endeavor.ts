import { defineCard } from "../define.js";

export default defineCard({
  name: "Grave Endeavor",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Roll two d10 and choose one result. Return a creature card from your graveyard to the battlefield with a number of +1/+1 counters on it equal to that result. Then each opponent loses X life and you gain X life, where X is the other result.",
  effect: {
    kind: "roll-dice",
    sides: 10,
    count: 2,
    then: {
      kind: "choose-value",
      value: "roll-result",
      then: {
        kind: "sequence",
        effects: [
          // A choice from the graveyard alone, a public zone: no library is
          // searched, so nothing shuffles.
          {
            kind: "search-library",
            zones: "graveyard",
            filter: { type: "creature" },
            destination: "battlefield",
            min: 1,
            max: 1,
            withCounters: { kind: "+1/+1", amount: "x" },
          },
          { kind: "lose-life", amount: { roll: "other" }, who: "each-opponent" },
          { kind: "gain-life", amount: { roll: "other" } },
        ],
      },
    },
  },
});
