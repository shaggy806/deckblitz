import { CHOSEN_COLOR } from "../../effects.js";
import { defineCard } from "../define.js";
import type { StaticCondition } from "../define.js";

// Lorwyn Eclipsed.
//
// The colour is chosen as the trigger resolves, after the draw (`choose-value`
// "color"), and the artifact becomes that one colour for good (layer 5,
// `become` with `setColors`). Five colors among your permanents is a permanent
// of each color (Case of the Shattered Pact's reading): a multicolored one
// counts for every color it has.

const ENTERS =
  "When this artifact enters, draw a card, then choose a color. This artifact becomes the chosen color.";
const DRAW = "{3}, {T}: Draw a card. Activate only if there are five colors among permanents you control.";

const youControl = (color: "W" | "U" | "B" | "R" | "G"): StaticCondition => ({
  kind: "controls",
  filter: { colors: [color] },
  atLeast: 1,
});

export default defineCard({
  name: "Puca's Eye",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${ENTERS}\n${DRAW}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "choose-value",
            value: "color",
            then: { kind: "become", target: "source", setColors: [CHOSEN_COLOR], duration: "permanent" },
          },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      condition: { kind: "all", of: [youControl("W"), youControl("U"), youControl("B"), youControl("R"), youControl("G")] },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW,
    },
  ],
});
