import { defineCard } from "../define.js";

// EDHREC rank 30391. Phyrexian Gremlins' shape, for a land.
const UNTAP_TEXT = "You may choose not to untap this creature during your untap step.";
const TAP_TEXT =
  "{T}: Tap target land. It doesn't untap during its controller's untap step for as long as this creature remains tapped.";

export default defineCard({
  name: "Mole Worms",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Worm"],
  power: 1,
  toughness: 1,
  text: `${UNTAP_TEXT}\n${TAP_TEXT}`,
  static: [{ affects: { scope: "self" }, mayChooseNotToUntap: true, text: UNTAP_TEXT }],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["land"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "restrict", target: 0, restrictions: ["doesnt-untap"], duration: "while-source-tapped" },
        ],
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
