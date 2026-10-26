import { defineCard } from "../define.js";
import type { StaticCondition } from "../define.js";
import type { Color } from "../../mana.js";

// Shadowmoor (SHM). EDHREC rank 21538.
//
// Rulings:
//   With no colour chosen (it entered some way that didn't ask), the trigger never triggers.
//
// A state trigger (rule 603.8): for whichever colour was chosen as it entered, "you control no
// permanents of that colour" — Lurebound itself counts if it has become that colour.
const COLORS: readonly Color[] = ["W", "U", "B", "R", "G"];
const NO_CHOSEN_COLOR: StaticCondition = {
  kind: "any",
  of: COLORS.map(
    (color): StaticCondition => ({
      kind: "all",
      of: [
        { kind: "chosen-on-enter", value: color },
        { kind: "not", of: { kind: "controls", filter: { colors: [color] }, atLeast: 1 } },
      ],
    }),
  ),
};

export default defineCard({
  name: "Lurebound Scarecrow",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 4,
  toughness: 4,
  text: "As this creature enters, choose a color.\nWhen you control no permanents of the chosen color, sacrifice this creature.",
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  triggered: [
    {
      trigger: { on: "state", state: NO_CHOSEN_COLOR },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When you control no permanents of the chosen color, sacrifice this creature.",
    },
  ],
});
