import { defineCard } from "../define.js";

const UNTAP_TEXT = "You may choose not to untap this artifact during your untap step.";
const TAP_TEXT =
  "{6}, {T}: Tap target creature. It doesn't untap during its controller's untap step for as long as this artifact remains tapped.";

export default defineCard({
  name: "Deserter's Quarters",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${UNTAP_TEXT}\n${TAP_TEXT}`,
  static: [{ affects: { scope: "self" }, mayChooseNotToUntap: true, text: UNTAP_TEXT }],
  activated: [
    {
      cost: { mana: "{6}", tap: true },
      targets: ["creature"],
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
