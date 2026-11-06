import { defineCard } from "../define.js";

// EDHREC rank 23676.

const TAPPED_TEXT = "This land enters tapped unless you control two or more other lands.";
const ENTER_TEXT = "When this land enters untapped, choose one —";

export default defineCard({
  name: "Quark's Bar",
  colors: [],
  types: ["land"],
  text: `${TAPPED_TEXT}\n${ENTER_TEXT}\n• This land deals 1 damage to each opponent.\n• Surveil 1.\n{T}: Add {R}.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: "{T}: Add {R}.",
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
            text: "This land deals 1 damage to each opponent.",
            effect: { kind: "damage", amount: 1, who: "each-opponent" },
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
