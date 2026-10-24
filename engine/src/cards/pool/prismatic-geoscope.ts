import { defineCard } from "../define.js";

// Domain mana: X units, each of any colour the player picks (Axebane
// Guardian's shape), X the basic land types among lands you control as the
// ability resolves — 0 with none (the ruling: it can be activated for nothing).
// Never colourless.

const MANA_TEXT =
  "Domain — {T}: Add X mana in any combination of colors, where X is the number of basic land types among lands you control.";

export default defineCard({
  name: "Prismatic Geoscope",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: `This artifact enters tapped.\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { oneOf: ["W", "U", "B", "R", "G"] },
        amount: { basicLandTypes: "you" },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
  ],
});
