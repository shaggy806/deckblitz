import { defineCard } from "../define.js";

// EDHREC rank 24898.

export default defineCard({
  name: "Sustaining Spirit",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Spirit"],
  power: 0,
  toughness: 3,
  text: "Cumulative upkeep {1}{W} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\nDamage that would reduce your life total to less than 1 reduces it to 1 instead.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "age", amount: 1 },
            {
              kind: "unless",
              chooser: "you",
              options: [
                {
                  pay: "{1}{W}",
                  times: { countersOn: "source", counter: "age" },
                  text: "Pay {1}{W} for each age counter",
                },
              ],
              otherwise: { kind: "sacrifice-source" },
            },
          ],
        },
      },
      resolve: null,
      text: "Cumulative upkeep {1}{W} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      damageLifeFloor: 1,
      text: "Damage that would reduce your life total to less than 1 reduces it to 1 instead.",
    },
  ],
});
