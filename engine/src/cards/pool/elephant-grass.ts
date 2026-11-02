import { defineCard } from "../define.js";

const CU_TEXT =
  "Cumulative upkeep {1} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)";
const BLACK = "Black creatures can't attack you.";
const NONBLACK = "Nonblack creatures can't attack you unless their controller pays {2} for each creature they control that's attacking you.";

// Both halves name you alone, so a planeswalker of yours can be attacked free.
export default defineCard({
  name: "Elephant Grass",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${CU_TEXT}\n${BLACK}\n${NONBLACK}`,
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
                  pay: "{1}",
                  times: { countersOn: "source", counter: "age" },
                  text: "Pay {1} for each age counter",
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
      affects: { scope: "filter", filter: { type: "creature", colors: ["B"] } },
      cantAttackController: "player",
      text: BLACK,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", notColors: ["B"] } },
      combatTax: { on: ["attack"], generic: 2, covers: "you" },
      text: NONBLACK,
    },
  ],
});
