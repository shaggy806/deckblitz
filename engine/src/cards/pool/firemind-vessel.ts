import { defineCard } from "../define.js";

// Commander Masters. "Two mana of different colors" is `add-mana`'s `different`: an offer per
// pairing by hand, an option per pairing to the payer, never two of one colour.

const TAP = "{T}: Add two mana of different colors.";

export default defineCard({
  name: "Firemind Vessel",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `This artifact enters tapped.\n${TAP}`,
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
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U", "B", "R", "G"], different: 1 }, amount: 2 },
      resolve: null,
      text: TAP,
    },
  ],
});
