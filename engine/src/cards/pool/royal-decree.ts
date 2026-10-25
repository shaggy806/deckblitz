import { defineCard } from "../define.js";

// Alliances. EDHREC rank 26433.
//
// Rulings:
//   [2008-10-01] Royal Decree's ability will trigger a maximum of once for each permanent that
//     becomes tapped, even if that permanent meets multiple criteria. (For example, Badlands is
//     both a Swamp and a Mountain.)
//
// Cumulative upkeep as Arnjlot's Ascent has it. The tap trigger is one
// ability with an `anyOf` filter, so a permanent matching several clauses
// triggers it once (the ruling); "that permanent's controller" is the
// trigger object's (Mesmeric Orb's `trigger-controller`).

const UPKEEP_TEXT =
  "Cumulative upkeep {W} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)";
const TAP_TEXT =
  "Whenever a Swamp, Mountain, black permanent, or red permanent becomes tapped, this enchantment deals 1 damage to that permanent's controller.";

export default defineCard({
  name: "Royal Decree",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n${TAP_TEXT}`,
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
                  pay: "{W}",
                  times: { countersOn: "source", counter: "age" },
                  text: "Pay {W} for each age counter",
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
    {
      trigger: {
        on: "becomes-tapped",
        who: "any",
        filter: {
          anyOf: [{ subtype: "Swamp" }, { subtype: "Mountain" }, { colors: ["B"] }, { colors: ["R"] }],
        },
      },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "trigger-controller" },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
