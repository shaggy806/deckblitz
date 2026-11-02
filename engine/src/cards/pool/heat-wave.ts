import { defineCard } from "../define.js";

const CU_TEXT =
  "Cumulative upkeep {R} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)";
const BLUE = "Blue creatures can't block creatures you control.";
const NONBLUE = "Nonblue creatures can't block creatures you control unless their controller pays 1 life for each blocking creature they control.";

export default defineCard({
  name: "Heat Wave",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${CU_TEXT}\n${BLUE}\n${NONBLUE}`,
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
                  pay: "{R}",
                  times: { countersOn: "source", counter: "age" },
                  text: "Pay {R} for each age counter",
                },
              ],
              otherwise: { kind: "sacrifice-source" },
            },
          ],
        },
      },
      resolve: null,
      text: CU_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" } },
      cantBeBlockedBy: { colors: ["U"] },
      text: BLUE,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", notColors: ["U"] } },
      combatTax: { on: ["block"], life: 1, attacker: { controlledBy: "you" } },
      text: NONBLUE,
    },
  ],
});
