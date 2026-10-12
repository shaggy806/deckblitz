import { defineCard } from "../define.js";

// EDHREC rank 9501.
// The first mode counts the creatures that left the battlefield under your
// control this turn — each as it last existed there (rule 603.10a), a token
// too — read as the ability resolves.

const ETB_TEXT = "When this creature enters, choose one —";
const COUNTER_MODE =
  "Put a +1/+1 counter on this creature for each creature that left the battlefield under your control this turn.";
const LIFE_MODE = "You gain 2 life and scry 2.";
const EXILE_MODE = "Exile target player's graveyard.";

export default defineCard({
  name: "Kutzil's Flanker",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Warrior"],
  power: 3,
  toughness: 1,
  keywords: ["flash"],
  text: `Flash\n${ETB_TEXT}\n• ${COUNTER_MODE}\n• ${LIFE_MODE}\n• ${EXILE_MODE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: COUNTER_MODE,
            effect: {
              kind: "add-counter",
              target: "source",
              counter: "+1/+1",
              amount: { turnHistory: "left", filter: { type: "creature" } },
            },
          },
          {
            text: LIFE_MODE,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "gain-life", amount: 2 },
                { kind: "scry", amount: 2 },
              ],
            },
          },
          { text: EXILE_MODE, targets: ["player"], effect: { kind: "exile-graveyard", target: 0 } },
        ],
      },
      resolve: null,
      text: `${ETB_TEXT} ${COUNTER_MODE} ${LIFE_MODE} ${EXILE_MODE}`,
    },
  ],
});
