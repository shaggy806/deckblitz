import { defineCard } from "../define.js";

// EDHREC rank 9253.
//
// Night Market's chosen colour, and Faeburrow Elder's "for each color among
// permanents you control" narrowed to monocolored ones: `multicolored: false`
// matches colourless permanents too, which have no colour to add.
const VISTA_TEXT = "{1}, {T}: For each color among monocolored permanents you control, add one mana of that color.";

export default defineCard({
  name: "Tarnation Vista",
  colors: [],
  types: ["land"],
  text: `This land enters tapped. As it enters, choose a color.\n{T}: Add one mana of the chosen color.\n${VISTA_TEXT}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "chosen", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of the chosen color.",
    },
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { eachColorAmong: { controlledBy: "you", multicolored: false } }, amount: 1 },
      resolve: null,
      text: VISTA_TEXT,
    },
  ],
});
