import { defineCard } from "../define.js";

// Domain: X is the basic land types among your lands, read as the ability
// resolves; any combination of the five colours (never colourless), and no
// mana with no basic land types (the rulings).
const MANA = "Domain — {T}: Add X mana in any combination of colors, where X is the number of basic land types among lands you control.";

export default defineCard({
  name: "Prismatic Geoscope",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: `This artifact enters tapped.\n${MANA}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U", "B", "R", "G"] }, amount: { basicLandTypes: "you" } },
      resolve: null,
      text: MANA,
    },
  ],
});
