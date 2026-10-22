import { defineCard } from "../define.js";

// EDHREC rank 28588.

const CU_TEXT =
  "Cumulative upkeep {2} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)";
const UNTAP_TEXT = "Creatures with flying don't untap during their controllers' untap steps.";

export default defineCard({
  name: "Blizzard",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `Cast this spell only if you control a snow land.\n${CU_TEXT}\n${UNTAP_TEXT}`,
  castOnlyIf: { kind: "controls", filter: { type: "land", supertype: "snow" }, atLeast: 1 },
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
                  pay: "{2}",
                  times: { countersOn: "source", counter: "age" },
                  text: "Pay {2} for each age counter",
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
      affects: { scope: "filter", filter: { type: "creature", keyword: "flying" } },
      restrictions: ["doesnt-untap"],
      text: UNTAP_TEXT,
    },
  ],
});
