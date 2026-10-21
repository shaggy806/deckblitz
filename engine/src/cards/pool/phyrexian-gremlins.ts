import { defineCard } from "../define.js";

// EDHREC rank 30728.

const UNTAP_TEXT = "You may choose not to untap this creature during your untap step.";

export default defineCard({
  name: "Phyrexian Gremlins",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Gremlin"],
  power: 1,
  toughness: 1,
  text: "You may choose not to untap this creature during your untap step.\n{T}: Tap target artifact. It doesn't untap during its controller's untap step for as long as this creature remains tapped.",
  static: [{ affects: { scope: "self" }, mayChooseNotToUntap: true, text: UNTAP_TEXT }],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["artifact"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "restrict", target: 0, restrictions: ["doesnt-untap"], duration: "while-source-tapped" },
        ],
      },
      resolve: null,
      text: "{T}: Tap target artifact. It doesn't untap during its controller's untap step for as long as this creature remains tapped.",
    },
  ],
});
