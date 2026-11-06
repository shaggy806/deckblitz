import { defineCard } from "../define.js";

// EDHREC rank 22506.

const TAPPED_TEXT = "This land enters tapped unless you control two or more other lands.";
const ENTER_TEXT = "When this land enters untapped, choose one —";

export default defineCard({
  name: "The Unicomplex",
  colors: [],
  types: ["land"],
  text: `${TAPPED_TEXT}\n${ENTER_TEXT}\n• Put target creature card from your graveyard on top of your library.\n• Surveil 1.\n{T}: Add {B}.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: 1 },
      resolve: null,
      text: "{T}: Add {B}.",
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
            text: "Put target creature card from your graveyard on top of your library.",
            targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
            effect: { kind: "put-on-library", target: 0, position: "top" },
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
