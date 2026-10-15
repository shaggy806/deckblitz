import { defineCard } from "../define.js";

// EDHREC rank 23644.
//
// Rulings:
//   [2025-11-17] The value of X is calculated only once, as Kithkeeper's first ability resolves.
//   [2025-11-17] Lands are normally colorless permanents, even if they tap for mana of a certain
//     color.
//   [2025-11-17] The colors are white, blue, black, red, and green. Colorless is not a color.
//
// "Tap three untapped creatures you control" has no {T}, so it may tap
// Kithkeeper itself and creatures that came under your control this turn
// (rule 302.6 — Root-Kin Ally's `tapOthers` with `includeSelf`).
const VIVID_TEXT =
  "Vivid — When this creature enters, create X 1/1 green and white Kithkin creature tokens, where X is the number of colors among permanents you control.";
const PUMP_TEXT = "Tap three untapped creatures you control: This creature gets +3/+0 and gains flying until end of turn.";

export default defineCard({
  name: "Kithkeeper",
  manaCost: "{6}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 3,
  text: `${VIVID_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Kithkin Token", count: { colorsAmong: { controlledBy: "you" } } },
      resolve: null,
      text: VIVID_TEXT,
    },
  ],
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 3, filter: { type: "creature", controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 3, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
