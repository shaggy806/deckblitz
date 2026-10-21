import { defineCard } from "../define.js";

// EDHREC rank 23454.

const UNTAP_TEXT = "You may choose not to untap this artifact during your untap step.";

export default defineCard({
  name: "Entrancing Lyre",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "You may choose not to untap this artifact during your untap step.\n{X}, {T}: Tap target creature with power X or less. It doesn't untap during its controller's untap step for as long as this artifact remains tapped.",
  static: [{ affects: { scope: "self" }, mayChooseNotToUntap: true, text: UNTAP_TEXT }],
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: "x" } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "restrict", target: 0, restrictions: ["doesnt-untap"], duration: "while-source-tapped" },
        ],
      },
      resolve: null,
      text: "{X}, {T}: Tap target creature with power X or less. It doesn't untap during its controller's untap step for as long as this artifact remains tapped.",
    },
  ],
});
