import { defineCard } from "../define.js";

// Ice Age.
//
// Every player's basic land types each tapped for another colour (`manaProduction`, one entry a
// land type, whoever taps it — rules 106.12, 614.1a): the amount kept, only the type changed.

const UPKEEP_TEXT =
  "Cumulative upkeep {1}{U}{U} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)";
const TWIST_TEXT =
  "If tapped for mana, Plains produce {R}, Swamps produce {G}, Mountains produce {W}, and Forests produce {B} instead of any other type.";

export default defineCard({
  name: "Reality Twist",
  manaCost: "{U}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n${TWIST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      manaProduction: [
        { filter: { type: "land", subtype: "Plains" }, produces: "R", tapper: "any" },
        { filter: { type: "land", subtype: "Swamp" }, produces: "G", tapper: "any" },
        { filter: { type: "land", subtype: "Mountain" }, produces: "W", tapper: "any" },
        { filter: { type: "land", subtype: "Forest" }, produces: "B", tapper: "any" },
      ],
      text: TWIST_TEXT,
    },
  ],
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
                  pay: "{1}{U}{U}",
                  times: { countersOn: "source", counter: "age" },
                  text: "Pay {1}{U}{U} for each age counter",
                },
              ],
              otherwise: { kind: "sacrifice-source" },
            },
          ],
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
