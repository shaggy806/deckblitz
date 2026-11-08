import { defineCard } from "../define.js";

// Alliances.
//
// - Cumulative upkeep—Pay {B} and 1 life: per age counter, {B} and 1 life in one payment
//   (`andLife`, multiplied by the counters).
// - Every land, whoever taps it, produces {B} instead of any other type (`manaProduction`, rules
//   106.12, 614.1a): the amount kept.

const UPKEEP_TEXT =
  "Cumulative upkeep—Pay {B} and 1 life. (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)";
const DARK_TEXT = "If a land is tapped for mana, it produces {B} instead of any other type.";

export default defineCard({
  name: "Infernal Darkness",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n${DARK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      manaProduction: [{ filter: { type: "land" }, produces: "B", tapper: "any" }],
      text: DARK_TEXT,
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
                  pay: "{B}",
                  andLife: 1,
                  times: { countersOn: "source", counter: "age" },
                  text: "Pay {B} and 1 life for each age counter",
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
