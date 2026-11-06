import { defineCard } from "../define.js";

// EDHREC rank 29781.

const TAPPED_TEXT = "This land enters tapped unless you control two or more other lands.";
const ENTER_TEXT = "When this land enters untapped, choose one —";

export default defineCard({
  name: "Q Continuum",
  colors: [],
  types: ["land"],
  text: `${TAPPED_TEXT}\n${ENTER_TEXT}\n• Target creature gets +1/+1 and gains vigilance until end of turn.\n• Surveil 1.\n{T}: Add {G}.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: "{T}: Add {G}.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self", filter: { tapped: false } },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Target creature gets +1/+1 and gains vigilance until end of turn.",
            targets: ["creature"],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
                { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
              ],
            },
          },
          { text: "Surveil 1.", effect: { kind: "surveil", amount: 1 } },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        tappedUnless: { kind: "controls", filter: { type: "land" }, atLeast: 2 },
      },
      text: TAPPED_TEXT,
    },
  ],
});
