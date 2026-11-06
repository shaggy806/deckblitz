import { defineCard } from "../define.js";

// EDHREC rank 26552.

const ENTER_TEXT = "When this land enters untapped, choose one —";

export default defineCard({
  name: "Ni'Var Science Academy",
  colors: [],
  types: ["land"],
  text: `This land enters tapped unless you control two or more other lands.\n${ENTER_TEXT}\n• Target creature gains flying until end of turn.\n• Surveil 1.\n{T}: Add {U}.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "U", amount: 1 },
      resolve: null,
      text: "{T}: Add {U}.",
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
            text: "Target creature gains flying until end of turn.",
            targets: ["creature"],
            effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
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
      text: "This land enters tapped unless you control two or more other lands.",
    },
  ],
});
