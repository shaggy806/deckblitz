import { defineCard } from "../define.js";

// EDHREC rank 11231.

const PUMP_MODE = "Target creature gets +2/+2 and gains vigilance until end of turn.";
const PROLIFERATE_MODE =
  "Proliferate. (Choose any number of permanents and/or players, then give each another counter of each kind already there.)";
const ENTERS_TEXT = `When this creature enters, choose one —\n• ${PUMP_MODE}\n• ${PROLIFERATE_MODE}`;

export default defineCard({
  name: "Adaptive Sporesinger",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Druid"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${ENTERS_TEXT}`,
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
            text: PUMP_MODE,
            targets: ["creature"],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
                { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
              ],
            },
          },
          { text: PROLIFERATE_MODE, effect: { kind: "proliferate" } },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
