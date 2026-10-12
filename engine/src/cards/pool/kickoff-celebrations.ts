import { defineCard } from "../define.js";
import { maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 10364. Bitter Reunion's loot. The haste goes to the creatures
// and Vehicles you control as the ability resolves (rule 611.2c) — a Vehicle
// that isn't a creature yet has it once crewed this turn.
const ENTERS_TEXT = "When this enchantment enters, you may discard a card. If you do, draw two cards.";
const HASTE_TEXT = "Sacrifice this enchantment: Creatures and Vehicles you control gain haste until end of turn.";

export default defineCard({
  name: "Kickoff Celebrations",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  keywords: ["start-your-engines"],
  text: `${START_YOUR_ENGINES_TEXT}\n${ENTERS_TEXT}\nMax speed — ${HASTE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to draw two cards?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: { kind: "draw", amount: 2 },
            },
          ],
        },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [
    maxSpeed({
      grantsActivated: [
        {
          cost: { mana: null, tap: false, sacrifice: "self" },
          targets: [],
          effect: {
            kind: "grant-keyword-all",
            filter: { controlledBy: "you", anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] },
            keyword: "haste",
            duration: "end-of-turn",
          },
          resolve: null,
          text: HASTE_TEXT,
        },
      ],
      text: `Max speed — ${HASTE_TEXT}`,
    }),
  ],
});
