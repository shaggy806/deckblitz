import { defineCard } from "../define.js";

// Fallen Empires. EDHREC rank 28779.
//
// "-2/-2" and "+1/+0" are counter kinds that modify P/T by themselves. The Thrull check reads the
// sacrificed creature as it last existed (`sacrificed`).
const UPKEEP = "At the beginning of your upkeep, put a -2/-2 counter on this creature.";
const SAC =
  "Sacrifice a creature: Remove a -2/-2 counter from this creature. If the sacrificed creature was a Thrull, put a +1/+0 counter on this creature. Activate only during your upkeep and only once each turn.";

export default defineCard({
  name: "Ebon Praetor",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Avatar", "Praetor"],
  power: 5,
  toughness: 5,
  keywords: ["first-strike", "trample"],
  text: `First strike, trample\n${UPKEEP}\n${SAC}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "-2/-2", amount: 1 },
      resolve: null,
      text: UPKEEP,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "remove-counter", target: "source", counter: "-2/-2", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "sacrificed", filter: { subtype: "Thrull" } },
            then: { kind: "add-counter", target: "source", counter: "+1/+0", amount: 1 },
          },
        ],
      },
      resolve: null,
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      oncePerTurn: true,
      text: SAC,
    },
  ],
});
